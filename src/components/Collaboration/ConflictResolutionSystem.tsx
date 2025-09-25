import React, { useCallback, useEffect, useState } from 'react'
import useCollaborationStore, { CollaborationOperation } from '@/store/collaborationStore'
import useMapStore from '@/store/mapStore'
import { MapObject } from '@/types'
import { Box, Text, Button, Modal, Badge } from '@/components/ui'
import {
  AlertTriangle,
  Users,
  GitMerge,
  Clock,
  User,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap
} from 'lucide-react'

interface ConflictResolutionSystemProps {
  isActive: boolean
}

interface ConflictGroup {
  objectId: string
  objectName: string
  operations: CollaborationOperation[]
  conflictType: 'position' | 'properties' | 'deletion' | 'creation'
  lastModified: Date
  involvedUsers: string[]
}

export const ConflictResolutionSystem: React.FC<ConflictResolutionSystemProps> = ({
  isActive
}) => {
  const [activeConflictGroup, setActiveConflictGroup] = useState<ConflictGroup | null>(null)
  const [selectedResolution, setSelectedResolution] = useState<'mine' | 'theirs' | 'merge' | 'cancel'>('merge')
  const [previewChanges, setPreviewChanges] = useState<MapObject | null>(null)

  const {
    conflictedOperations,
    connectedUsers,
    currentUser,
    resolveConflict,
    getConflictingOperations,
    mergeOperations,
    detectConflict
  } = useCollaborationStore()

  const { currentMap, getObjectById, updateObject } = useMapStore()

  // Group conflicts by object
  const conflictGroups = React.useMemo(() => {
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
  }, [conflictedOperations, getObjectById])

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

  // Get conflict type icon and color
  const getConflictTypeInfo = useCallback((type: ConflictGroup['conflictType']) => {
    switch (type) {
      case 'creation':
        return { icon: <CheckCircle size={16} />, color: '$success', label: 'Creation Conflict' }
      case 'deletion':
        return { icon: <XCircle size={16} />, color: '$error', label: 'Deletion Conflict' }
      case 'position':
        return { icon: <ArrowRight size={16} />, color: '$warning', label: 'Position Conflict' }
      case 'properties':
        return { icon: <GitMerge size={16} />, color: '$primary', label: 'Properties Conflict' }
      default:
        return { icon: <AlertTriangle size={16} />, color: '$gray500', label: 'Unknown Conflict' }
    }
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

      case 'theirs':
        // Apply the latest external change
        const latestExternal = group.operations
          .filter(op => op.userId !== currentUser?.id)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]

        if (latestExternal) {
          previewObj = applyOperationToObject(previewObj, latestExternal)
        }
        break

      case 'merge':
        // Apply all operations in chronological order
        const sortedOps = group.operations.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        for (const op of sortedOps) {
          previewObj = applyOperationToObject(previewObj, op)
        }
        break
    }

    return previewObj
  }, [getObjectById, currentUser])

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

  // Handle conflict resolution
  const handleResolveConflict = useCallback((group: ConflictGroup, resolution: 'mine' | 'theirs' | 'merge' | 'cancel') => {
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
        css={{
          position: 'fixed',
          top: 60,
          right: 20,
          left: 20,
          backgroundColor: '$warning',
          color: 'white',
          padding: '$3 $4',
          borderRadius: '$md',
          display: 'flex',
          alignItems: 'center',
          gap: '$3',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <AlertTriangle size={20} />
        <Box css={{ flex: 1 }}>
          <Text size="sm" weight="semibold">
            {conflictGroups.length} Editing Conflict{conflictGroups.length !== 1 ? 's' : ''} Detected
          </Text>
          <Text size="xs" css={{ opacity: 0.9 }}>
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
        >
          <Zap size={16} />
          Auto-Resolve
        </Button>
      </Box>

      {/* Conflict List (when multiple conflicts exist) */}
      {conflictGroups.length > 1 && !activeConflictGroup && (
        <Box
          css={{
            position: 'fixed',
            top: 120,
            right: 20,
            width: 350,
            maxHeight: 400,
            backgroundColor: '$dndBlack',
            border: '1px solid $gray800',
            borderRadius: '$md',
            padding: '$4',
            zIndex: 1001,
            overflow: 'auto'
          }}
        >
          <Text size="lg" weight="semibold" css={{ marginBottom: '$3' }}>
            Active Conflicts
          </Text>

          {conflictGroups.map((group, index) => {
            const typeInfo = getConflictTypeInfo(group.conflictType)

            return (
              <Box
                key={group.objectId}
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '$3',
                  padding: '$3',
                  marginBottom: '$2',
                  backgroundColor: '$gray800',
                  borderRadius: '$sm',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '$gray700'
                  }
                }}
                onClick={() => setActiveConflictGroup(group)}
              >
                <Box css={{ color: typeInfo.color }}>
                  {typeInfo.icon}
                </Box>

                <Box css={{ flex: 1 }}>
                  <Text size="sm" weight="medium">{group.objectName}</Text>
                  <Text size="xs" color="gray400">
                    {group.operations.length} changes by {group.involvedUsers.length} user{group.involvedUsers.length !== 1 ? 's' : ''}
                  </Text>
                </Box>

                <Box css={{ display: 'flex', alignItems: 'center', gap: '$1' }}>
                  <Clock size={12} />
                  <Text size="xs" color="gray500">
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
          title="Resolve Editing Conflict"
          size="lg"
        >
          <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4' }}>
            {/* Conflict Overview */}
            <Box
              css={{
                padding: '$3',
                backgroundColor: '$gray800',
                borderRadius: '$md'
              }}
            >
              <Box css={{ display: 'flex', alignItems: 'center', gap: '$3', marginBottom: '$2' }}>
                {getConflictTypeInfo(activeConflictGroup.conflictType).icon}
                <Text size="md" weight="semibold">
                  {activeConflictGroup.objectName}
                </Text>
                <Badge variant="warning">
                  {getConflictTypeInfo(activeConflictGroup.conflictType).label}
                </Badge>
              </Box>

              <Text size="sm" color="gray400">
                {activeConflictGroup.operations.length} conflicting changes by{' '}
                {activeConflictGroup.involvedUsers.map(userId => {
                  const user = connectedUsers.get(userId)
                  return user?.name || 'Unknown User'
                }).join(', ')}
              </Text>
            </Box>

            {/* Resolution Options */}
            <Box>
              <Text size="sm" weight="medium" css={{ marginBottom: '$3' }}>
                Choose resolution method:
              </Text>

              <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
                {/* Keep Mine */}
                <Box
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '$3',
                    padding: '$3',
                    border: `2px solid ${selectedResolution === 'mine' ? 'var(--colors-primary)' : 'var(--colors-gray700)'}`,
                    borderRadius: '$md',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '$primary'
                    }
                  }}
                  onClick={() => setSelectedResolution('mine')}
                >
                  <input
                    type="radio"
                    name="resolution"
                    checked={selectedResolution === 'mine'}
                    onChange={() => setSelectedResolution('mine')}
                  />
                  <Box>
                    <Text size="sm" weight="medium">Keep My Changes</Text>
                    <Text size="xs" color="gray400">
                      Discard other users' changes and keep your version
                    </Text>
                  </Box>
                </Box>

                {/* Accept Theirs */}
                <Box
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '$3',
                    padding: '$3',
                    border: `2px solid ${selectedResolution === 'theirs' ? 'var(--colors-primary)' : 'var(--colors-gray700)'}`,
                    borderRadius: '$md',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '$primary'
                    }
                  }}
                  onClick={() => setSelectedResolution('theirs')}
                >
                  <input
                    type="radio"
                    name="resolution"
                    checked={selectedResolution === 'theirs'}
                    onChange={() => setSelectedResolution('theirs')}
                  />
                  <Box>
                    <Text size="sm" weight="medium">Accept Their Changes</Text>
                    <Text size="xs" color="gray400">
                      Use the most recent changes from other users
                    </Text>
                  </Box>
                </Box>

                {/* Merge Changes */}
                <Box
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '$3',
                    padding: '$3',
                    border: `2px solid ${selectedResolution === 'merge' ? 'var(--colors-primary)' : 'var(--colors-gray700)'}`,
                    borderRadius: '$md',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '$primary'
                    }
                  }}
                  onClick={() => setSelectedResolution('merge')}
                >
                  <input
                    type="radio"
                    name="resolution"
                    checked={selectedResolution === 'merge'}
                    onChange={() => setSelectedResolution('merge')}
                  />
                  <Box>
                    <Text size="sm" weight="medium">Merge All Changes</Text>
                    <Text size="xs" color="gray400">
                      Combine all changes in chronological order (recommended)
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Preview Changes */}
            {previewChanges && (
              <Box
                css={{
                  padding: '$3',
                  backgroundColor: '$gray900',
                  borderRadius: '$md',
                  border: '1px solid $primary'
                }}
              >
                <Text size="sm" weight="medium" css={{ marginBottom: '$2' }}>
                  Preview Result:
                </Text>

                <Box css={{ fontSize: '$xs', fontFamily: 'monospace' }}>
                  <Text size="xs" color="gray400">Object ID: {previewChanges.id}</Text>
                  <Text size="xs" color="gray400">
                    Position: ({previewChanges.position.x}, {previewChanges.position.y})
                  </Text>
                  {previewChanges.name && (
                    <Text size="xs" color="gray400">Name: {previewChanges.name}</Text>
                  )}
                  <Text size="xs" color="gray400">
                    Size: {previewChanges.width || 50}×{previewChanges.height || 50}
                  </Text>
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box css={{ display: 'flex', justifyContent: 'flex-end', gap: '$2' }}>
              <Button
                variant="outline"
                onClick={() => handleResolveConflict(activeConflictGroup, 'cancel')}
              >
                Cancel
              </Button>

              <Button
                onClick={() => handleResolveConflict(activeConflictGroup, selectedResolution)}
              >
                <GitMerge size={16} />
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