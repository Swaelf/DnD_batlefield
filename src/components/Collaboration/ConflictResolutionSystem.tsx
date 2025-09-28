import { useCallback, useEffect, useState, useMemo } from 'react'
import {
  AlertTriangle,
  GitMerge,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap
} from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { useCollaborationStore } from '@/store/collaborationStore'
import useMapStore from '@/store/mapStore'
import type { CollaborationOperation } from '@/store/collaborationStore'
import type { MapObject } from '@/types'

type ConflictResolutionSystemProps = {
  isActive: boolean
}

type ConflictGroup = {
  objectId: string
  objectName: string
  operations: CollaborationOperation[]
  conflictType: 'position' | 'properties' | 'deletion' | 'creation'
  lastModified: Date
  involvedUsers: string[]
}

type ResolutionMethod = 'mine' | 'theirs' | 'merge' | 'cancel'

export const ConflictResolutionSystem = ({
  isActive
}: ConflictResolutionSystemProps) => {
  const [activeConflictGroup, setActiveConflictGroup] = useState<ConflictGroup | null>(null)
  const [selectedResolution, setSelectedResolution] = useState<ResolutionMethod>('merge')
  const [previewChanges, setPreviewChanges] = useState<MapObject | null>(null)

  const {
    conflictedOperations,
    connectedUsers,
    currentUser,
    resolveConflict
  } = useCollaborationStore()

  const { currentMap, updateObject } = useMapStore()

  // Helper to get object by ID
  const getObjectById = useCallback((id: string) => {
    return currentMap?.objects.find(obj => obj.id === id)
  }, [currentMap])

  // Determine conflict type
  const getConflictType = useCallback((operation: CollaborationOperation): ConflictGroup['conflictType'] => {
    switch (operation.type) {
      case 'object:create':
        return 'creation'
      case 'object:delete':
        return 'deletion'
      case 'object:move':
        return 'position'
      case 'object:update':
        return 'properties'
      default:
        return 'properties'
    }
  }, [])

  // Group conflicts by object
  const conflictGroups = useMemo(() => {
    const groups: Map<string, ConflictGroup> = new Map()

    conflictedOperations.forEach(operation => {
      const objectId = operation.data?.objectId || operation.id
      const existingGroup = groups.get(objectId)

      if (existingGroup) {
        existingGroup.operations.push(operation)
        if (!existingGroup.involvedUsers.includes(operation.userId)) {
          existingGroup.involvedUsers.push(operation.userId)
        }
        if (operation.timestamp > existingGroup.lastModified) {
          existingGroup.lastModified = operation.timestamp
        }
      } else {
        const obj = getObjectById(objectId)
        groups.set(objectId, {
          objectId,
          objectName: obj?.name || `Object ${objectId.slice(-8)}`,
          operations: [operation],
          conflictType: getConflictType(operation),
          lastModified: operation.timestamp,
          involvedUsers: [operation.userId]
        })
      }
    })

    return Array.from(groups.values()).sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
  }, [conflictedOperations, getObjectById, getConflictType])

  // Get conflict type icon and color
  const getConflictTypeInfo = useCallback((type: ConflictGroup['conflictType']) => {
    switch (type) {
      case 'creation':
        return { icon: <CheckCircle size={16} />, color: 'var(--success)', label: 'Creation Conflict' }
      case 'deletion':
        return { icon: <XCircle size={16} />, color: 'var(--error)', label: 'Deletion Conflict' }
      case 'position':
        return { icon: <ArrowRight size={16} />, color: 'var(--warning)', label: 'Position Conflict' }
      case 'properties':
        return { icon: <GitMerge size={16} />, color: 'var(--primary)', label: 'Properties Conflict' }
      default:
        return { icon: <AlertTriangle size={16} />, color: 'var(--gray500)', label: 'Unknown Conflict' }
    }
  }, [])

  // Apply operation to object (simplified)
  const applyOperationToObject = useCallback((obj: MapObject, operation: CollaborationOperation): MapObject => {
    const newObj = { ...obj }

    switch (operation.type) {
      case 'object:move':
        if (operation.data?.position) {
          newObj.position = operation.data.position
        }
        break

      case 'object:update':
        Object.assign(newObj, operation.data?.updates || {})
        break

      case 'object:delete':
        // For deletion, we'd handle this differently in the actual implementation
        break
    }

    return newObj
  }, [])

  // Generate preview of merged changes
  const generatePreview = useCallback((group: ConflictGroup, resolution: string): MapObject | null => {
    const baseObject = getObjectById(group.objectId)
    if (!baseObject) return null

    let previewObj = { ...baseObject }

    switch (resolution) {
      case 'mine':
        // Keep current state
        break

      case 'theirs': {
        // Apply the latest external change
        const latestExternal = group.operations
          .filter(op => op.userId !== currentUser?.id)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]

        if (latestExternal) {
          previewObj = applyOperationToObject(previewObj, latestExternal)
        }
        break
      }

      case 'merge': {
        // Apply all operations in chronological order
        const sortedOps = group.operations.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        for (const op of sortedOps) {
          previewObj = applyOperationToObject(previewObj, op)
        }
        break
      }
    }

    return previewObj
  }, [getObjectById, currentUser, applyOperationToObject])

  // Handle conflict resolution
  const handleResolveConflict = useCallback((group: ConflictGroup, resolution: ResolutionMethod) => {
    if (resolution === 'cancel') {
      setActiveConflictGroup(null)
      return
    }

    // Generate the resolved object
    const resolvedObject = generatePreview(group, resolution)
    if (resolvedObject) {
      updateObject(resolvedObject.id, resolvedObject)
    }

    // Mark all operations in the group as resolved
    group.operations.forEach(operation => {
      resolveConflict(operation.id, 'accept')
    })

    setActiveConflictGroup(null)
    setPreviewChanges(null)
  }, [generatePreview, updateObject, resolveConflict])

  // Auto-resolve simple conflicts
  const handleAutoResolve = useCallback((group: ConflictGroup) => {
    // Auto-resolve based on conflict type and user permissions
    if (group.conflictType === 'position' && group.operations.length === 2) {
      // For position conflicts with 2 users, use the most recent
      handleResolveConflict(group, 'theirs')
    } else {
      // For complex conflicts, open manual resolution
      setActiveConflictGroup(group)
    }
  }, [handleResolveConflict])

  const handleResolutionChange = useCallback((resolution: ResolutionMethod) => {
    setSelectedResolution(resolution)
  }, [])

  // Update preview when resolution method changes
  useEffect(() => {
    if (activeConflictGroup) {
      const preview = generatePreview(activeConflictGroup, selectedResolution)
      setPreviewChanges(preview)
    }
  }, [activeConflictGroup, selectedResolution, generatePreview])

  // Auto-detect and handle conflicts
  useEffect(() => {
    if (conflictGroups.length > 0 && !activeConflictGroup) {
      // Show notification for new conflicts
      console.log(`${conflictGroups.length} conflict(s) detected`)
    }
  }, [conflictGroups.length, activeConflictGroup])

  if (!isActive || conflictGroups.length === 0) {
    return null
  }

  return (
    <>
      {/* Conflict Notification Bar */}
      <Box
        style={{
          position: 'fixed',
          top: '60px',
          right: '20px',
          left: '20px',
          backgroundColor: 'var(--warning)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: 'var(--radii-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <AlertTriangle size={20} />
        <Box style={{ flex: 1 }}>
          <Text size="sm" weight="semibold">
            {conflictGroups.length} Editing Conflict{conflictGroups.length !== 1 ? 's' : ''} Detected
          </Text>
          <Text size="xs" style={{ opacity: 0.9 }}>
            Multiple users are editing the same objects
          </Text>
        </Box>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => setActiveConflictGroup(conflictGroups[0])}
        >
          Resolve Now
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleAutoResolve(conflictGroups[0])}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Zap size={16} />
          Auto-Resolve
        </Button>
      </Box>

      {/* Conflict List (when multiple conflicts exist) */}
      {conflictGroups.length > 1 && !activeConflictGroup && (
        <Box
          style={{
            position: 'fixed',
            top: '120px',
            right: '20px',
            width: '350px',
            maxHeight: '400px',
            backgroundColor: 'var(--gray900)',
            border: '1px solid var(--gray700)',
            borderRadius: 'var(--radii-md)',
            padding: '16px',
            zIndex: 1001,
            overflow: 'auto'
          }}
        >
          <Text size="lg" weight="semibold">
            Active Conflicts
          </Text>

          {conflictGroups.map((group) => {
            const typeInfo = getConflictTypeInfo(group.conflictType)

            return (
              <Box
                key={group.objectId}
                onClick={() => setActiveConflictGroup(group)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: 'var(--gray800)',
                  borderRadius: 'var(--radii-sm)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--gray700)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--gray800)'
                }}
              >
                <Box style={{ color: typeInfo.color }}>
                  {typeInfo.icon}
                </Box>

                <Box style={{ flex: 1 }}>
                  <Text size="sm" weight="medium">{group.objectName}</Text>
                  <Text size="xs" color="textSecondary">
                    {group.operations.length} changes by {group.involvedUsers.length} user{group.involvedUsers.length !== 1 ? 's' : ''}
                  </Text>
                </Box>

                <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  <Text size="xs" color="textTertiary">
                    {group.lastModified.toLocaleTimeString()}
                  </Text>
                </Box>
              </Box>
            )
          })}
        </Box>
      )}

      {/* Conflict Resolution Dialog */}
      {activeConflictGroup && (
        <Modal
          isOpen={true}
          onClose={() => setActiveConflictGroup(null)}
        >
          <Box
            style={{
              width: '600px',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <Box
              padding={4}
              style={{
                borderBottom: '1px solid var(--gray700)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <GitMerge size={20} />
              <Text size="lg" weight="semibold">
                Resolve Editing Conflict
              </Text>
            </Box>

            {/* Content */}
            <Box
              padding={4}
              style={{
                flex: 1,
                overflow: 'auto'
              }}
            >
              {/* Conflict Overview */}
              <Box
                marginBottom={4}
                padding={3}
                style={{
                  backgroundColor: 'var(--gray800)',
                  borderRadius: 'var(--radii-md)'
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }} marginBottom={2}>
                  {getConflictTypeInfo(activeConflictGroup.conflictType).icon}
                  <Text size="md" weight="semibold">
                    {activeConflictGroup.objectName}
                  </Text>
                  <Badge variant="warning">
                    {getConflictTypeInfo(activeConflictGroup.conflictType).label}
                  </Badge>
                </Box>

                <Text size="sm" color="textSecondary">
                  {activeConflictGroup.operations.length} conflicting changes by{' '}
                  {activeConflictGroup.involvedUsers.map(userId => {
                    const user = connectedUsers.get(userId)
                    return user?.name || 'Unknown User'
                  }).join(', ')}
                </Text>
              </Box>

              {/* Resolution Options */}
              <Box marginBottom={4}>
                <Text size="sm" weight="medium">
                  Choose resolution method:
                </Text>

                <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Keep Mine */}
                  <Box
                    onClick={() => handleResolutionChange('mine')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: `2px solid ${selectedResolution === 'mine' ? 'var(--primary)' : 'var(--gray700)'}`,
                      borderRadius: 'var(--radii-md)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedResolution !== 'mine') {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedResolution !== 'mine') {
                        e.currentTarget.style.borderColor = 'var(--gray700)'
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="resolution"
                      checked={selectedResolution === 'mine'}
                      onChange={() => handleResolutionChange('mine')}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <Box>
                      <Text size="sm" weight="medium">Keep My Changes</Text>
                      <Text size="xs" color="textSecondary">
                        Discard other users' changes and keep your version
                      </Text>
                    </Box>
                  </Box>

                  {/* Accept Theirs */}
                  <Box
                    onClick={() => handleResolutionChange('theirs')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: `2px solid ${selectedResolution === 'theirs' ? 'var(--primary)' : 'var(--gray700)'}`,
                      borderRadius: 'var(--radii-md)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedResolution !== 'theirs') {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedResolution !== 'theirs') {
                        e.currentTarget.style.borderColor = 'var(--gray700)'
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="resolution"
                      checked={selectedResolution === 'theirs'}
                      onChange={() => handleResolutionChange('theirs')}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <Box>
                      <Text size="sm" weight="medium">Accept Their Changes</Text>
                      <Text size="xs" color="textSecondary">
                        Use the most recent changes from other users
                      </Text>
                    </Box>
                  </Box>

                  {/* Merge Changes */}
                  <Box
                    onClick={() => handleResolutionChange('merge')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: `2px solid ${selectedResolution === 'merge' ? 'var(--primary)' : 'var(--gray700)'}`,
                      borderRadius: 'var(--radii-md)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedResolution !== 'merge') {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedResolution !== 'merge') {
                        e.currentTarget.style.borderColor = 'var(--gray700)'
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="resolution"
                      checked={selectedResolution === 'merge'}
                      onChange={() => handleResolutionChange('merge')}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <Box>
                      <Text size="sm" weight="medium">Merge All Changes</Text>
                      <Text size="xs" color="textSecondary">
                        Combine all changes in chronological order (recommended)
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Preview Changes */}
              {previewChanges && (
                <Box
                  padding={3}
                  style={{
                    backgroundColor: 'var(--gray900)',
                    borderRadius: 'var(--radii-md)',
                    border: '1px solid var(--primary)'
                  }}
                >
                  <Text size="sm" weight="medium">
                    Preview Result:
                  </Text>

                  <Box style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    <Text size="xs" color="textSecondary">Object ID: {previewChanges.id}</Text>
                    <Text size="xs" color="textSecondary">
                      Position: ({previewChanges.position.x}, {previewChanges.position.y})
                    </Text>
                    {previewChanges.name && (
                      <Text size="xs" color="textSecondary">Name: {previewChanges.name}</Text>
                    )}
                    <Text size="xs" color="textSecondary">
                      Size: {previewChanges.width || 50}×{previewChanges.height || 50}
                    </Text>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Box
              padding={4}
              style={{
                borderTop: '1px solid var(--gray700)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px'
              }}
            >
              <Button
                onClick={() => handleResolveConflict(activeConflictGroup, 'cancel')}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>

              <Button
                onClick={() => handleResolveConflict(activeConflictGroup, selectedResolution)}
                variant="primary"
                size="sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <GitMerge size={14} />
                Apply Resolution
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </>
  )
}

export default ConflictResolutionSystem