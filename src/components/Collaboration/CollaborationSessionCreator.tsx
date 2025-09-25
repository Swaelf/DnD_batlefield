import React, { useState, useCallback } from 'react'
import useCollaborationStore from '@/store/collaborationStore'
import useMapStore from '@/store/mapStore'
import { Box, Text, Button, Input, Modal, Select } from '@/components/ui'
import { UserPlus, Users, Settings, Crown } from 'lucide-react'

interface CollaborationSessionCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSessionCreated?: (sessionId: string) => void
}

export const CollaborationSessionCreator: React.FC<CollaborationSessionCreatorProps> = ({
  isOpen,
  onClose,
  onSessionCreated
}) => {
  const [sessionName, setSessionName] = useState('')
  const [maxUsers, setMaxUsers] = useState(10)
  const [allowAnonymous, setAllowAnonymous] = useState(true)
  const [requireApproval, setRequireApproval] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const { createSession } = useCollaborationStore()
  const { currentMap } = useMapStore()

  const handleCreateSession = useCallback(async () => {
    if (!currentMap) return

    setIsCreating(true)
    try {
      const session = await createSession(currentMap.id, {
        allowAnonymous,
        requireApproval,
        lockLayersForPlayers: true,
        shareViewport: false,
        enableVoiceChat: false,
        enableTextChat: true
      })

      onSessionCreated?.(session.id)
      onClose()
    } catch (error) {
      console.error('Failed to create session:', error)
    } finally {
      setIsCreating(false)
    }
  }, [currentMap, createSession, allowAnonymous, requireApproval, onSessionCreated, onClose])

  const resetForm = useCallback(() => {
    setSessionName('')
    setMaxUsers(10)
    setAllowAnonymous(true)
    setRequireApproval(false)
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Start Collaboration Session">
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4', minWidth: 400 }}>
        {/* Session Overview */}
        <Box
          css={{
            padding: '$3',
            backgroundColor: '$gray800',
            borderRadius: '$md'
          }}
        >
          <Box css={{ display: 'flex', alignItems: 'center', gap: '$2', marginBottom: '$2' }}>
            <Crown size={16} />
            <Text css={{ fontSize: '$md', fontWeight: '$semibold' }}>
              Create New Session
            </Text>
          </Box>
          <Text css={{ fontSize: '$sm', color: '$gray400' }}>
            You'll be the Game Master (host) with full permissions. Invite players to collaborate in real-time.
          </Text>
        </Box>

        {/* Session Settings */}
        <Box>
          <Text css={{ fontSize: '$sm', fontWeight: '$medium', marginBottom: '$2' }}>
            Session Settings
          </Text>

          <Box css={{ display: 'flex', flexDirection: 'column', gap: '$3' }}>
            {/* Session Name */}
            <Box>
              <Text css={{ fontSize: '$xs', color: '$gray300', marginBottom: '$1' }}>
                Session Name (optional):
              </Text>
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={`${currentMap?.name || 'Map'} Session`}
                fullWidth
              />
            </Box>

            {/* Max Users */}
            <Box>
              <Text css={{ fontSize: '$xs', color: '$gray300', marginBottom: '$1' }}>
                Maximum Users:
              </Text>
              <Select
                value={maxUsers.toString()}
                onValueChange={(value) => setMaxUsers(parseInt(value, 10))}
              >
                <option value="5">5 users</option>
                <option value="10">10 users</option>
                <option value="15">15 users</option>
                <option value="25">25 users</option>
              </Select>
            </Box>

            {/* Permission Options */}
            <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
              <Text css={{ fontSize: '$xs', color: '$gray300' }}>Permissions:</Text>

              <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                <input
                  type="checkbox"
                  id="allowAnonymous"
                  checked={allowAnonymous}
                  onChange={(e) => setAllowAnonymous(e.target.checked)}
                />
                <label htmlFor="allowAnonymous">
                  <Text css={{ fontSize: '$xs' }}>Allow anonymous users</Text>
                </label>
              </Box>

              <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                />
                <label htmlFor="requireApproval">
                  <Text css={{ fontSize: '$xs' }}>Require approval to join</Text>
                </label>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Feature Preview */}
        <Box
          css={{
            padding: '$3',
            backgroundColor: '$gray900',
            borderRadius: '$md',
            border: '1px solid $gray700'
          }}
        >
          <Text css={{ fontSize: '$xs', fontWeight: '$medium', marginBottom: '$2' }}>
            Collaboration Features:
          </Text>
          <Box css={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '$2' }}>
            <Text css={{ fontSize: '$xs', color: '$gray400' }}>• Real-time cursors</Text>
            <Text css={{ fontSize: '$xs', color: '$gray400' }}>• Live object editing</Text>
            <Text css={{ fontSize: '$xs', color: '$gray400' }}>• Text chat system</Text>
            <Text css={{ fontSize: '$xs', color: '$gray400' }}>• Conflict resolution</Text>
            <Text css={{ fontSize: '$xs', color: '$gray400' }}>• Role-based permissions</Text>
            <Text css={{ fontSize: '$xs', color: '$gray400' }}>• User management</Text>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box css={{ display: 'flex', justifyContent: 'flex-end', gap: '$2' }}>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateSession}
            loading={isCreating}
            disabled={!currentMap}
          >
            <Users size={16} />
            Create Session
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default CollaborationSessionCreator