import { useState, useCallback, type FC, type ChangeEvent } from 'react'
import { Users, Crown } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { Modal } from '@/components/ui/Modal'
import { useCollaborationStore } from '@/store/collaborationStore'
import useMapStore from '@/store/mapStore'

type CollaborationSessionCreatorProps = {
  isOpen: boolean
  onClose: () => void
  onSessionCreated?: (sessionId: string) => void
}

export const CollaborationSessionCreator = ({
  isOpen,
  onClose,
  onSessionCreated
}: CollaborationSessionCreatorProps) => {
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

  const handleSessionNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSessionName(e.target.value)
  }, [])

  const handleMaxUsersChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setMaxUsers(parseInt(e.target.value, 10))
  }, [])

  const handleAllowAnonymousChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setAllowAnonymous(e.target.checked)
  }, [])

  const handleRequireApprovalChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRequireApproval(e.target.checked)
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Box
        style={{
          width: '500px',
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
          <Crown size={20} />
          <Text size="lg" weight="semibold">
            Start Collaboration Session
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
          {/* Session Overview */}
          <Box
            marginBottom={4}
            padding={3}
            style={{
              backgroundColor: 'var(--gray800)',
              borderRadius: 'var(--radii-md)',
              border: '1px solid var(--gray700)'
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }} marginBottom={2}>
              <Crown size={16} />
              <Text size="md" weight="medium">
                Game Master Session
              </Text>
            </Box>
            <Text size="sm" color="textSecondary">
              You'll be the Game Master (host) with full permissions. Invite players to collaborate in real-time.
            </Text>
          </Box>

          {/* Session Settings */}
          <Box marginBottom={4}>
            <Text size="md" weight="medium">
              Session Settings
            </Text>

            {/* Session Name */}
            <Box marginBottom={3}>
              <FieldLabel htmlFor="sessionName">
                Session Name (optional)
              </FieldLabel>
              <Input
                id="sessionName"
                value={sessionName}
                onChange={handleSessionNameChange}
                placeholder={`${currentMap?.name || 'Map'} Session`}
              />
            </Box>

            {/* Max Users */}
            <Box marginBottom={3}>
              <FieldLabel htmlFor="maxUsers">
                Maximum Users
              </FieldLabel>
              <select
                id="maxUsers"
                value={maxUsers.toString()}
                onChange={handleMaxUsersChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--gray700)',
                  border: '1px solid var(--gray600)',
                  borderRadius: 'var(--radii-md)',
                  color: 'var(--white)',
                  fontSize: '14px'
                }}
              >
                <option value="5">5 users</option>
                <option value="10">10 users</option>
                <option value="15">15 users</option>
                <option value="25">25 users</option>
              </select>
            </Box>

            {/* Permission Options */}
            <Box>
              <Text size="sm" weight="medium">
                Permissions
              </Text>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Allow Anonymous */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="allowAnonymous"
                    checked={allowAnonymous}
                    onChange={handleAllowAnonymousChange}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: 'var(--primary)'
                    }}
                  />
                  <FieldLabel htmlFor="allowAnonymous" style={{ margin: 0 }}>
                    Allow anonymous users
                  </FieldLabel>
                </Box>

                {/* Require Approval */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="requireApproval"
                    checked={requireApproval}
                    onChange={handleRequireApprovalChange}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: 'var(--primary)'
                    }}
                  />
                  <FieldLabel htmlFor="requireApproval" style={{ margin: 0 }}>
                    Require approval to join
                  </FieldLabel>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Feature Preview */}
          <Box
            padding={3}
            style={{
              backgroundColor: 'var(--gray900)',
              borderRadius: 'var(--radii-md)',
              border: '1px solid var(--gray700)'
            }}
          >
            <Text size="sm" weight="medium">
              Collaboration Features
            </Text>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <Text size="xs" color="textSecondary">• Real-time cursors</Text>
              <Text size="xs" color="textSecondary">• Live object editing</Text>
              <Text size="xs" color="textSecondary">• Text chat system</Text>
              <Text size="xs" color="textSecondary">• Conflict resolution</Text>
              <Text size="xs" color="textSecondary">• Role-based permissions</Text>
              <Text size="xs" color="textSecondary">• User management</Text>
            </Box>
          </Box>
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
            onClick={handleClose}
            variant="outline"
            size="sm"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateSession}
            variant="primary"
            size="sm"
            disabled={!currentMap || isCreating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Users size={14} />
            {isCreating ? 'Creating...' : 'Create Session'}
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default CollaborationSessionCreator