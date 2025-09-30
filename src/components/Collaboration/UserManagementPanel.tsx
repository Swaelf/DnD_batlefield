import React, { useCallback, useState } from 'react'
import {
  Users,
  UserPlus,
  Crown,
  Shield,
  Eye,
  Mail,
  Copy,
  Check,
  X,
  Edit3,
  Trash2
} from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useCollaborationStore } from '@/store/collaborationStore'
import type { UserRole, CollaborativeUser } from '@/store/collaborationStore'

type UserManagementPanelProps = {
  isOpen: boolean
  onClose: () => void
}

export const UserManagementPanel = ({
  isOpen,
  onClose
}: UserManagementPanelProps) => {
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('player')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newUserName, setNewUserName] = useState('')

  const {
    currentSession,
    currentUser,
    isHost,
    connectedUsers,
    inviteUser,
    removeUser,
    updateUserRole,
    getUsersInSession,
    hasPermission
  } = useCollaborationStore()

  const users = getUsersInSession()
  const canManageUsers = isHost || hasPermission(currentUser?.id || '', 'canInvite')

  // Role configuration
  const roleConfig = {
    gm: {
      name: 'Game Master',
      description: 'Full access to all features',
      icon: <Crown size={16} />,
      color: '#FFD700',
      permissions: [
        'Full map editing rights',
        'Layer management',
        'User management',
        'Export capabilities',
        'Session settings'
      ]
    },
    player: {
      name: 'Player',
      description: 'Can edit and add objects',
      icon: <Shield size={16} />,
      color: '#4ECDC4',
      permissions: [
        'Object creation and editing',
        'Token movement',
        'Basic drawing tools',
        'Chat participation'
      ]
    },
    observer: {
      name: 'Observer',
      description: 'View-only access',
      icon: <Eye size={16} />,
      color: '#95A5A6',
      permissions: [
        'View map content',
        'Follow other cursors',
        'Chat participation',
        'No editing rights'
      ]
    }
  }

  // Handle user invitation
  const handleInviteUser = useCallback(async () => {
    if (!inviteEmail.trim()) return

    try {
      await inviteUser(inviteEmail, inviteRole)
      setInviteEmail('')
      setInviteRole('player')
      setShowInviteDialog(false)

      // Show success feedback
      alert(`Invitation sent to ${inviteEmail}`)
    } catch (error) {
      console.error('Failed to invite user:', error)
      alert('Failed to send invitation')
    }
  }, [inviteEmail, inviteRole, inviteUser])

  // Handle role change
  const handleRoleChange = useCallback((userId: string, newRole: UserRole) => {
    updateUserRole(userId, newRole)
  }, [updateUserRole])

  // Handle user removal
  const handleRemoveUser = useCallback((userId: string, userName: string) => {
    if (confirm(`Remove ${userName} from the session?`)) {
      removeUser(userId)
    }
  }, [removeUser])

  // Handle name edit
  const handleNameEdit = useCallback((userId: string, currentName: string) => {
    setEditingUser(userId)
    setNewUserName(currentName)
  }, [])

  const handleNameSave = useCallback(() => {
    // In a real implementation, this would update the user's name
    setEditingUser(null)
    setNewUserName('')
  }, [])

  // Get user status
  const getUserStatus = useCallback((user: CollaborativeUser) => {
    if (!user.isOnline) return 'Offline'
    if (user.cursor?.visible) return 'Active'
    return 'Online'
  }, [])

  // Get user activity indicator
  const getActivityColor = useCallback((user: CollaborativeUser) => {
    if (!user.isOnline) return '#95A5A6'
    if (user.cursor?.visible) return '#2ECC71'
    return '#F39C12'
  }, [])

  const handleInviteEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteEmail(e.target.value)
  }, [])

  const handleInviteRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setInviteRole(e.target.value as UserRole)
  }, [])

  const handleNewUserNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserName(e.target.value)
  }, [])

  if (!isOpen || !currentSession) return null

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}
      />

      {/* Main Panel */}
      <Box
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          maxHeight: '80vh',
          backgroundColor: 'var(--gray900)',
          border: '1px solid var(--gray700)',
          borderRadius: 'var(--radii-md)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--gray700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={20} />
            <Text size="lg" weight="semibold">User Management</Text>
            <Badge variant="secondary">{users.length} users</Badge>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {canManageUsers && (
              <Button
                size="sm"
                onClick={() => setShowInviteDialog(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <UserPlus size={16} />
                Invite User
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </Box>
        </Box>

        {/* Session Info */}
        <Box style={{ padding: '16px', borderBottom: '1px solid var(--gray700)' }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Text size="sm" weight="medium">Session: {currentSession.name}</Text>
              <Text size="xs" color="textSecondary">
                Created {currentSession.createdAt.toLocaleDateString()} by {
                  connectedUsers.get(currentSession.createdBy)?.name || 'Unknown'
                }
              </Text>
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                size="xs"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(currentSession.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Copy size={14} />
                Copy ID
              </Button>

              <Box
                style={{
                  padding: '4px 8px',
                  backgroundColor: currentSession.isActive ? 'var(--success)' : 'var(--gray700)',
                  color: 'white',
                  borderRadius: 'var(--radii-xs)',
                  fontSize: '12px'
                }}
              >
                {currentSession.isActive ? 'Active' : 'Inactive'}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Users List */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          <Box style={{ padding: '16px' }}>
            {/* Current User */}
            {currentUser && (
              <Box marginBottom={4}>
                <Text size="sm" weight="medium">
                  You ({roleConfig[currentUser.role].name})
                </Text>

                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: 'var(--radii-md)',
                    border: '2px solid var(--primary)'
                  }}
                >
                  <Avatar
                    size="md"
                    fallback={currentUser.name.charAt(0)}
                    style={{
                      backgroundColor: currentUser.color,
                      color: 'white'
                    }}
                  />

                  <Box style={{ flex: 1 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Text size="sm" weight="medium">{currentUser.name}</Text>
                      {roleConfig[currentUser.role].icon}
                      <Badge
                        variant="primary"
                        style={{ backgroundColor: roleConfig[currentUser.role].color }}
                      >
                        {roleConfig[currentUser.role].name}
                      </Badge>
                    </Box>

                    <Text size="xs" color="textSecondary">
                      {getUserStatus(currentUser)} • Joined {currentUser.lastSeen.toLocaleTimeString()}
                    </Text>
                  </Box>

                  <Box
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getActivityColor(currentUser)
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Other Users */}
            {users.filter(user => user.id !== currentUser?.id).length > 0 && (
              <Box>
                <Text size="sm" weight="medium">
                  Other Users ({users.filter(user => user.id !== currentUser?.id).length})
                </Text>

                <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {users
                    .filter(user => user.id !== currentUser?.id)
                    .map(user => (
                      <Box
                        key={user.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          backgroundColor: 'var(--gray800)',
                          borderRadius: 'var(--radii-md)',
                          border: '1px solid var(--gray700)'
                        }}
                      >
                        <Avatar
                          size="sm"
                          fallback={user.name.charAt(0)}
                          style={{
                            backgroundColor: user.color,
                            color: 'white'
                          }}
                        />

                        <Box style={{ flex: 1 }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {editingUser === user.id ? (
                              <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Input
                                  value={newUserName}
                                  onChange={handleNewUserNameChange}
                                  style={{ width: '120px' }}
                                />
                                <Button
                                  size="xs"
                                  onClick={() => handleNameSave()}
                                >
                                  <Check size={12} />
                                </Button>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => setEditingUser(null)}
                                >
                                  <X size={12} />
                                </Button>
                              </Box>
                            ) : (
                              <>
                                <Text size="sm" weight="medium">{user.name}</Text>
                                {canManageUsers && (
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => handleNameEdit(user.id, user.name)}
                                  >
                                    <Edit3 size={12} />
                                  </Button>
                                )}
                              </>
                            )}

                            {roleConfig[user.role].icon}
                          </Box>

                          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text size="xs" color="textSecondary">
                              {getUserStatus(user)} • {user.lastSeen.toLocaleTimeString()}
                            </Text>

                            {user.selection?.objectIds && user.selection.objectIds.length > 0 && (
                              <Badge variant="outline" size="sm">
                                {user.selection.objectIds.length} selected
                              </Badge>
                            )}
                          </Box>
                        </Box>

                        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Box
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: getActivityColor(user)
                            }}
                          />

                          {canManageUsers && (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: 'var(--gray700)',
                                border: '1px solid var(--gray600)',
                                borderRadius: 'var(--radii-sm)',
                                color: 'var(--white)',
                                fontSize: '12px'
                              }}
                            >
                              <option value="gm">GM</option>
                              <option value="player">Player</option>
                              <option value="observer">Observer</option>
                            </select>
                          )}

                          {canManageUsers && user.id !== currentSession.createdBy && (
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleRemoveUser(user.id, user.name)}
                              style={{ color: 'var(--error)' }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </Box>
                      </Box>
                    ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Session Statistics */}
        <Box
          style={{
            padding: '16px',
            borderTop: '1px solid var(--gray700)',
            backgroundColor: 'var(--gray800)'
          }}
        >
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <Box style={{ textAlign: 'center' }}>
              <Text size="lg" weight="bold" color="primary">
                {users.filter(u => u.isOnline).length}
              </Text>
              <Text size="xs" color="textSecondary">Online</Text>
            </Box>

            <Box style={{ textAlign: 'center' }}>
              <Text size="lg" weight="bold" color="success">
                {users.filter(u => u.cursor?.visible).length}
              </Text>
              <Text size="xs" color="textSecondary">Active</Text>
            </Box>

            <Box style={{ textAlign: 'center' }}>
              <Text size="lg" weight="bold" color="warning">
                {users.filter(u => u.role === 'gm').length}
              </Text>
              <Text size="xs" color="textSecondary">GMs</Text>
            </Box>

            <Box style={{ textAlign: 'center' }}>
              <Text size="lg" weight="bold" color="secondary">
                {currentSession.maxUsers - users.length}
              </Text>
              <Text size="xs" color="textSecondary">Slots Left</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Invite User Dialog */}
      <Modal
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
      >
        <Box
          style={{
            width: '400px',
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
            <Mail size={20} />
            <Text size="lg" weight="semibold">
              Invite User
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
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Box>
                <FieldLabel htmlFor="inviteEmail">Email Address</FieldLabel>
                <Input
                  id="inviteEmail"
                  value={inviteEmail}
                  onChange={handleInviteEmailChange}
                  placeholder="user@example.com"
                  autoFocus
                />
              </Box>

              <Box>
                <FieldLabel htmlFor="inviteRole">Role</FieldLabel>
                <select
                  id="inviteRole"
                  value={inviteRole}
                  onChange={handleInviteRoleChange}
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
                  <option value="observer">Observer</option>
                  <option value="player">Player</option>
                  <option value="gm">Game Master</option>
                </select>

                {/* Role Description */}
                <Box
                  marginTop={2}
                  padding={3}
                  style={{
                    backgroundColor: 'var(--gray800)',
                    borderRadius: 'var(--radii-sm)'
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }} marginBottom={2}>
                    {roleConfig[inviteRole].icon}
                    <Text size="sm" weight="medium">{roleConfig[inviteRole].name}</Text>
                  </Box>

                  <Text size="xs" color="textSecondary">
                    {roleConfig[inviteRole].description}
                  </Text>

                  <Text size="xs" weight="medium">Permissions:</Text>
                  {roleConfig[inviteRole].permissions.map((permission, index) => (
                    <Text key={index} size="xs" color="textTertiary" style={{ display: 'block' }}>
                      • {permission}
                    </Text>
                  ))}
                </Box>
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
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteUser}
              disabled={!inviteEmail.trim()}
              variant="primary"
              size="sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Mail size={14} />
              Send Invitation
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default UserManagementPanel