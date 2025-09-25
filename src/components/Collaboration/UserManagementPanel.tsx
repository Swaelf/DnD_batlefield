import React, { useCallback, useState } from 'react'
import useCollaborationStore, { UserRole, CollaborativeUser } from '@/store/collaborationStore'
import { Box, Text, Button, Select, Input, Modal, Avatar, Badge } from '@/components/ui'
import {
  Users,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Eye,
  Settings,
  Mail,
  Copy,
  Check,
  X,
  Clock,
  Edit3,
  Trash2
} from 'lucide-react'

interface UserManagementPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({
  isOpen,
  onClose
}) => {
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

  const handleNameSave = useCallback((userId: string) => {
    // In a real implementation, this would update the user's name
    console.log(`Update user ${userId} name to: ${newUserName}`)
    setEditingUser(null)
    setNewUserName('')
  }, [newUserName])

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

  if (!isOpen || !currentSession) return null

  return (
    <>
      {/* Backdrop */}
      <Box
        css={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}
        onClick={onClose}
      />

      {/* Main Panel */}
      <Box
        css={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          maxHeight: '80vh',
          backgroundColor: '$dndBlack',
          border: '1px solid $gray800',
          borderRadius: '$md',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          css={{
            padding: '$4',
            borderBottom: '1px solid $gray800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box css={{ display: 'flex', alignItems: 'center', gap: '$3' }}>
            <Users size={20} />
            <Text size="lg" weight="semibold">User Management</Text>
            <Badge variant="secondary">{users.length} users</Badge>
          </Box>

          <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
            {canManageUsers && (
              <Button
                size="sm"
                onClick={() => setShowInviteDialog(true)}
              >
                <UserPlus size={16} />
                Invite User
              </Button>
            )}

            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={16} />
            </Button>
          </Box>
        </Box>

        {/* Session Info */}
        <Box css={{ padding: '$4', borderBottom: '1px solid $gray800' }}>
          <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Text size="sm" weight="medium">Session: {currentSession.name}</Text>
              <Text size="xs" color="gray400">
                Created {currentSession.createdAt.toLocaleDateString()} by {
                  connectedUsers.get(currentSession.createdBy)?.name || 'Unknown'
                }
              </Text>
            </Box>

            <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
              <Button
                size="xs"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(currentSession.id)}
              >
                <Copy size={14} />
                Copy ID
              </Button>

              <Text
                size="xs"
                css={{
                  padding: '$1 $2',
                  backgroundColor: currentSession.isActive ? '$success' : '$gray700',
                  color: 'white',
                  borderRadius: '$xs'
                }}
              >
                {currentSession.isActive ? 'Active' : 'Inactive'}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Users List */}
        <Box css={{ flex: 1, overflow: 'auto' }}>
          <Box css={{ padding: '$4' }}>
            {/* Current User */}
            {currentUser && (
              <Box css={{ marginBottom: '$4' }}>
                <Text size="sm" weight="medium" css={{ marginBottom: '$2' }}>
                  You ({roleConfig[currentUser.role].name})
                </Text>

                <Box
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '$3',
                    padding: '$3',
                    backgroundColor: '$gray800',
                    borderRadius: '$md',
                    border: '2px solid $primary'
                  }}
                >
                  <Avatar
                    size="md"
                    css={{
                      backgroundColor: currentUser.color,
                      color: 'white'
                    }}
                  >
                    {currentUser.name.charAt(0)}
                  </Avatar>

                  <Box css={{ flex: 1 }}>
                    <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                      <Text size="sm" weight="medium">{currentUser.name}</Text>
                      {roleConfig[currentUser.role].icon}
                      <Badge
                        variant="default"
                        css={{ backgroundColor: roleConfig[currentUser.role].color }}
                      >
                        {roleConfig[currentUser.role].name}
                      </Badge>
                    </Box>

                    <Text size="xs" color="gray400">
                      {getUserStatus(currentUser)} • Joined {currentUser.lastSeen.toLocaleTimeString()}
                    </Text>
                  </Box>

                  <Box
                    css={{
                      width: 12,
                      height: 12,
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
                <Text size="sm" weight="medium" css={{ marginBottom: '$2' }}>
                  Other Users ({users.filter(user => user.id !== currentUser?.id).length})
                </Text>

                <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
                  {users
                    .filter(user => user.id !== currentUser?.id)
                    .map(user => (
                      <Box
                        key={user.id}
                        css={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '$3',
                          padding: '$3',
                          backgroundColor: '$gray900',
                          borderRadius: '$md',
                          border: '1px solid $gray700'
                        }}
                      >
                        <Avatar
                          size="sm"
                          css={{
                            backgroundColor: user.color,
                            color: 'white'
                          }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>

                        <Box css={{ flex: 1 }}>
                          <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                            {editingUser === user.id ? (
                              <Box css={{ display: 'flex', alignItems: 'center', gap: '$1' }}>
                                <Input
                                  value={newUserName}
                                  onChange={(e) => setNewUserName(e.target.value)}
                                  size="xs"
                                  css={{ width: 120 }}
                                />
                                <Button
                                  size="xs"
                                  onClick={() => handleNameSave(user.id)}
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

                          <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                            <Text size="xs" color="gray400">
                              {getUserStatus(user)} • {user.lastSeen.toLocaleTimeString()}
                            </Text>

                            {user.selection?.objectIds && user.selection.objectIds.length > 0 && (
                              <Badge variant="outline" size="xs">
                                {user.selection.objectIds.length} selected
                              </Badge>
                            )}
                          </Box>
                        </Box>

                        <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                          <Box
                            css={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: getActivityColor(user)
                            }}
                          />

                          {canManageUsers && (
                            <Select
                              value={user.role}
                              onValueChange={(newRole: UserRole) => handleRoleChange(user.id, newRole)}
                              size="xs"
                            >
                              <option value="gm">GM</option>
                              <option value="player">Player</option>
                              <option value="observer">Observer</option>
                            </Select>
                          )}

                          {canManageUsers && user.id !== currentSession.createdBy && (
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleRemoveUser(user.id, user.name)}
                              css={{ color: '$error' }}
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
          css={{
            padding: '$4',
            borderTop: '1px solid $gray800',
            backgroundColor: '$gray900'
          }}
        >
          <Box css={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '$4' }}>
            <Box css={{ textAlign: 'center' }}>
              <Text size="lg" weight="bold" color="primary">
                {users.filter(u => u.isOnline).length}
              </Text>
              <Text size="xs" color="gray400">Online</Text>
            </Box>

            <Box css={{ textAlign: 'center' }}>
              <Text size="lg" weight="bold" color="success">
                {users.filter(u => u.cursor?.visible).length}
              </Text>
              <Text size="xs" color="gray400">Active</Text>
            </Box>

            <Box css={{ textAlign: 'center' }}>
              <Text size="lg" weight="bold" color="warning">
                {users.filter(u => u.role === 'gm').length}
              </Text>
              <Text size="xs" color="gray400">GMs</Text>
            </Box>

            <Box css={{ textAlign: 'center' }}>
              <Text size="lg" weight="bold" color="secondary">
                {currentSession.maxUsers - users.length}
              </Text>
              <Text size="xs" color="gray400">Slots Left</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Invite User Dialog */}
      <Modal
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        title="Invite User"
      >
        <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4' }}>
          <Box>
            <Text size="sm" css={{ marginBottom: '$2' }}>Email Address:</Text>
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@example.com"
              fullWidth
              autoFocus
            />
          </Box>

          <Box>
            <Text size="sm" css={{ marginBottom: '$2' }}>Role:</Text>
            <Select
              value={inviteRole}
              onValueChange={(role: UserRole) => setInviteRole(role)}
            >
              <option value="observer">Observer</option>
              <option value="player">Player</option>
              <option value="gm">Game Master</option>
            </Select>

            {/* Role Description */}
            <Box
              css={{
                marginTop: '$2',
                padding: '$3',
                backgroundColor: '$gray800',
                borderRadius: '$sm'
              }}
            >
              <Box css={{ display: 'flex', alignItems: 'center', gap: '$2', marginBottom: '$2' }}>
                {roleConfig[inviteRole].icon}
                <Text size="sm" weight="medium">{roleConfig[inviteRole].name}</Text>
              </Box>

              <Text size="xs" color="gray400" css={{ marginBottom: '$2' }}>
                {roleConfig[inviteRole].description}
              </Text>

              <Text size="xs" css={{ fontWeight: 'medium', marginBottom: '$1' }}>Permissions:</Text>
              {roleConfig[inviteRole].permissions.map((permission, index) => (
                <Text key={index} size="xs" color="gray300" css={{ display: 'block' }}>
                  • {permission}
                </Text>
              ))}
            </Box>
          </Box>

          <Box css={{ display: 'flex', justifyContent: 'flex-end', gap: '$2' }}>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteUser}
              disabled={!inviteEmail.trim()}
            >
              <Mail size={16} />
              Send Invitation
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default UserManagementPanel