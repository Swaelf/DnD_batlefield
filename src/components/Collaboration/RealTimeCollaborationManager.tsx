import { useCallback, useEffect, useState, useRef, type FC, type RefObject, type ChangeEvent, type KeyboardEvent, type FormEvent } from 'react'
import { Group, Text as KonvaText, Rect } from 'react-konva'
import type Konva from 'konva'
import { Users, MessageSquare, Settings, UserPlus, Crown, Eye } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { useCollaborationStore } from '@/store/collaborationStore'
import useMapStore from '@/store/mapStore'
import type { CollaborativeUser } from '@/store/collaborationStore'

export type RealTimeCollaborationManagerProps = {
  stageRef?: RefObject<Konva.Stage>
  isActive: boolean
}

export const RealTimeCollaborationManager: FC<RealTimeCollaborationManagerProps> = ({
  stageRef,
  isActive
}) => {
  const [showUserList, setShowUserList] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isTypingTimeout, setIsTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  const chatContainerRef = useRef<HTMLDivElement>(null)

  const {
    connectionStatus,
    currentSession,
    currentUser,
    isHost,
    connectedUsers,
    userCursors,
    userSelections,
    chatMessages,
    unreadMessages,
    isTyping,
    disconnect,
    createSession,
    joinSession,
    updateCursor,
    updateSelection,
    sendMessage,
    sendDiceRoll,
    setTyping,
    markMessagesAsRead,
    inviteUser,
    removeUser,
    getUsersInSession
  } = useCollaborationStore()

  const { selectedObjects, currentMap } = useMapStore()

  // Handle cursor movement
  const handleMouseMove = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive || !stageRef?.current || connectionStatus !== 'connected') return

    const stage = stageRef.current
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    updateCursor({ x: pos.x, y: pos.y, visible: true })
  }, [isActive, stageRef, connectionStatus, updateCursor])

  // Handle selection changes
  useEffect(() => {
    if (connectionStatus === 'connected') {
      updateSelection(selectedObjects)
    }
  }, [selectedObjects, connectionStatus, updateSelection])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (isTypingTimeout) {
        clearTimeout(isTypingTimeout)
      }
    }
  }, [isTypingTimeout])

  // Handle mouse leave to hide cursor
  const handleMouseLeave = useCallback(() => {
    updateCursor({ x: 0, y: 0, visible: false })
  }, [updateCursor])

  // Setup stage event listeners
  useEffect(() => {
    if (!stageRef?.current || !isActive) return

    const stage = stageRef.current
    stage.on('mousemove', handleMouseMove)
    stage.on('mouseleave', handleMouseLeave)

    return () => {
      stage.off('mousemove', handleMouseMove)
      stage.off('mouseleave', handleMouseLeave)
    }
  }, [stageRef, isActive, handleMouseMove, handleMouseLeave])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // Handle chat input
  const handleChatSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    // Check for dice roll pattern
    const dicePattern = /^\/roll\s+(.+)$/i
    const diceMatch = chatInput.match(dicePattern)

    if (diceMatch) {
      sendDiceRoll(diceMatch[1])
    } else {
      sendMessage(chatInput)
    }

    setChatInput('')
    setTyping(false)

    if (isTypingTimeout) {
      clearTimeout(isTypingTimeout)
      setIsTypingTimeout(null)
    }
  }, [chatInput, sendMessage, sendDiceRoll, setTyping, isTypingTimeout])

  // Handle typing indicators
  const handleChatInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value)

    if (!isTyping.get(currentUser?.id || '')) {
      setTyping(true)
    }

    if (isTypingTimeout) {
      clearTimeout(isTypingTimeout)
    }

    const timeout = setTimeout(() => {
      setTyping(false)
      setIsTypingTimeout(null)
    }, 2000)

    setIsTypingTimeout(timeout)
  }, [currentUser, isTyping, setTyping, isTypingTimeout])

  // Start collaboration session
  const handleStartSession = useCallback(async () => {
    if (!currentMap) return

    try {
      await createSession(currentMap.id, {
        enableTextChat: true,
        lockLayersForPlayers: true
      })
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }, [currentMap, createSession])

  // Join collaboration session
  const handleJoinSession = useCallback(async () => {
    const sessionId = prompt('Enter session ID:')
    if (!sessionId) return

    try {
      await joinSession(sessionId, {
        name: prompt('Enter your name:') || 'Anonymous'
      })
    } catch (error) {
      console.error('Failed to join session:', error)
    }
  }, [joinSession])

  // Get online users list
  const onlineUsers = getUsersInSession()
  const typingUsers = Array.from(isTyping.entries())
    .filter(([userId, typing]) => typing && userId !== currentUser?.id)
    .map(([userId]) => connectedUsers.get(userId))
    .filter(Boolean) as CollaborativeUser[]

  if (!isActive) return null

  return (
    <>
      {/* User Cursors on Canvas */}
      {stageRef?.current && connectionStatus === 'connected' && (
        <Group>
          {Array.from(userCursors.entries()).map(([userId, cursor]) => {
            const user = connectedUsers.get(userId)
            if (!user || !cursor.visible || userId === currentUser?.id) return null

            return (
              <Group key={userId} x={cursor.x} y={cursor.y}>
                {/* Cursor pointer */}
                <Group rotation={-45}>
                  <Rect
                    width={12}
                    height={18}
                    fill={user.color}
                    stroke="#FFFFFF"
                    strokeWidth={1}
                  />
                  <Rect
                    x={12}
                    y={10}
                    width={8}
                    height={8}
                    fill={user.color}
                    stroke="#FFFFFF"
                    strokeWidth={1}
                  />
                </Group>

                {/* User name label */}
                <Group x={15} y={-5}>
                  <Rect
                    width={user.name.length * 7 + 8}
                    height={20}
                    fill={user.color}
                    cornerRadius={4}
                  />
                  <KonvaText
                    x={4}
                    y={4}
                    text={user.name}
                    fontSize={12}
                    fontFamily="Arial"
                    fill="#FFFFFF"
                  />
                </Group>
              </Group>
            )
          })}

          {/* User Selections */}
          {Array.from(userSelections.entries()).map(([userId, objectIds]) => {
            const user = connectedUsers.get(userId)
            if (!user || userId === currentUser?.id || objectIds.length === 0) return null

            return (
              <Group key={`selection-${userId}`}>
                {objectIds.map(objectId => {
                  const obj = currentMap?.objects.find(o => o.id === objectId)
                  if (!obj) return null

                  return (
                    <Rect
                      key={objectId}
                      x={obj.position.x - 2}
                      y={obj.position.y - 2}
                      width={(obj.width || 50) + 4}
                      height={(obj.height || 50) + 4}
                      stroke={user.color}
                      strokeWidth={2}
                      dash={[6, 3]}
                      listening={false}
                      opacity={0.8}
                    />
                  )
                })}
              </Group>
            )
          })}
        </Group>
      )}

      {/* Collaboration Controls */}
      <Box
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 1000
        }}
      >
        {connectionStatus === 'disconnected' ? (
          <Box style={{ display: 'flex', gap: '8px' }}>
            <Button
              onClick={handleStartSession}
              variant="primary"
              size="sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Crown size={16} />
              Host Session
            </Button>
            <Button
              onClick={handleJoinSession}
              variant="outline"
              size="sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Users size={16} />
              Join Session
            </Button>
          </Box>
        ) : (
          <Box style={{ display: 'flex', gap: '8px' }}>
            {/* Connection Status */}
            <Box
              style={{
                padding: '6px 12px',
                backgroundColor: connectionStatus === 'connected' ? 'var(--success)' : 'var(--warning)',
                borderRadius: 'var(--radii-sm)',
                color: 'white',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Box
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'currentColor',
                  borderRadius: '50%'
                }}
              />
              {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
            </Box>

            {/* Users List Toggle */}
            <Button
              variant={showUserList ? 'primary' : 'outline'}
              onClick={() => setShowUserList(!showUserList)}
              size="sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Users size={16} />
              {onlineUsers.length}
            </Button>

            {/* Chat Toggle */}
            <Button
              variant={showChat ? 'primary' : 'outline'}
              onClick={() => {
                setShowChat(!showChat)
                if (!showChat) markMessagesAsRead()
              }}
              size="sm"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <MessageSquare size={16} />
              {unreadMessages > 0 && (
                <Box
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: 'var(--error)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </Box>
              )}
            </Button>

            {/* Settings Toggle */}
            {isHost && (
              <Button
                variant={showSettings ? 'primary' : 'outline'}
                onClick={() => setShowSettings(!showSettings)}
                size="sm"
              >
                <Settings size={16} />
              </Button>
            )}

            {/* Leave Session */}
            <Button
              onClick={disconnect}
              variant="outline"
              size="sm"
            >
              Leave
            </Button>
          </Box>
        )}
      </Box>

      {/* Users List Panel */}
      {showUserList && connectionStatus === 'connected' && (
        <Box
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '300px',
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
            Online Users ({onlineUsers.length})
          </Text>

          {onlineUsers.map(user => (
            <Box
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: user.id === currentUser?.id ? 'var(--gray800)' : 'transparent',
                borderRadius: 'var(--radii-sm)'
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
                <Text size="sm" weight="medium">
                  {user.name}
                  {user.id === currentUser?.id && ' (You)'}
                </Text>
                <Text size="xs" color="textSecondary">
                  {user.role === 'gm' ? 'Game Master' :
                   user.role === 'player' ? 'Player' : 'Observer'}
                </Text>
              </Box>

              {user.cursor?.visible && (
                <Eye size={14} color="var(--success)" />
              )}

              {isHost && user.id !== currentUser?.id && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => removeUser(user.id)}
                >
                  Remove
                </Button>
              )}
            </Box>
          ))}

          {isHost && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const email = prompt('Enter email to invite:')
                if (email) void inviteUser(email, 'player')
              }}
              style={{
                width: '100%',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center'
              }}
            >
              <UserPlus size={16} />
              Invite User
            </Button>
          )}
        </Box>
      )}

      {/* Chat Panel */}
      {showChat && connectionStatus === 'connected' && (
        <Box
          style={{
            position: 'fixed',
            bottom: '80px',
            right: showUserList ? '340px' : '20px',
            width: '350px',
            height: '400px',
            backgroundColor: 'var(--gray900)',
            border: '1px solid var(--gray700)',
            borderRadius: 'var(--radii-md)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1001,
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <Box
            style={{
              padding: '12px',
              borderBottom: '1px solid var(--gray700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Text size="md" weight="semibold">Chat</Text>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setShowChat(false)}
            >
              ×
            </Button>
          </Box>

          {/* Messages */}
          <Box
            ref={chatContainerRef}
            style={{
              flex: 1,
              padding: '8px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {chatMessages.map(message => {
              const user = connectedUsers.get(message.userId)
              const isOwn = message.userId === currentUser?.id

              return (
                <Box
                  key={message.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    opacity: message.type === 'system' ? 0.7 : 1
                  }}
                >
                  {!isOwn && user && (
                    <Avatar
                      size="sm"
                      fallback={user.name.charAt(0)}
                      style={{
                        backgroundColor: user.color,
                        color: 'white',
                        fontSize: '12px'
                      }}
                    />
                  )}

                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }} marginBottom={1}>
                      <Text
                        size="xs"
                        weight="medium"
                        style={{ color: user?.color || 'var(--gray400)' }}
                      >
                        {message.userName}
                      </Text>
                      <Text size="xs" color="textTertiary">
                        {message.timestamp.toLocaleTimeString()}
                      </Text>
                    </Box>

                    {message.type === 'dice' ? (
                      <Box
                        style={{
                          padding: '8px',
                          backgroundColor: 'var(--gray800)',
                          borderRadius: 'var(--radii-sm)',
                          border: '1px solid var(--success)'
                        }}
                      >
                        <Text size="sm">
                          🎲 {message.message}
                        </Text>
                        {message.diceRoll && (
                          <Text size="xs" color="success">
                            Result: {message.diceRoll.result} ({message.diceRoll.breakdown})
                          </Text>
                        )}
                      </Box>
                    ) : (
                      <Text size="sm" style={{ wordBreak: 'break-word' }}>
                        {message.message}
                      </Text>
                    )}
                  </Box>
                </Box>
              )
            })}

            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                <Text size="xs" color="textSecondary">
                  {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </Text>
              </Box>
            )}
          </Box>

          {/* Chat Input */}
          <Box style={{ padding: '12px', borderTop: '1px solid var(--gray700)' }}>
            <form onSubmit={handleChatSubmit}>
              <Input
                value={chatInput}
                onChange={handleChatInputChange}
                placeholder="Type a message... (/roll 1d20 for dice)"
                style={{ width: '100%' }}
              />
            </form>
            <Text size="xs" color="textTertiary">
              Use /roll [dice] for dice rolls (e.g., /roll 1d20+5)
            </Text>
          </Box>
        </Box>
      )}

      {/* Settings Panel */}
      {showSettings && isHost && connectionStatus === 'connected' && currentSession && (
        <Box
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '300px',
            backgroundColor: 'var(--gray900)',
            border: '1px solid var(--gray700)',
            borderRadius: 'var(--radii-md)',
            padding: '16px',
            zIndex: 1001
          }}
        >
          <Text size="lg" weight="semibold">
            Session Settings
          </Text>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Box>
              <Text size="sm">Session Name:</Text>
              <Input
                value={currentSession.name}
                onChange={(_e: ChangeEvent<HTMLInputElement>) => {
                  // updateSessionSettings({ name: e.target.value })
                }}
                style={{ width: '100%' }}
              />
            </Box>

            <Box>
              <Text size="sm">Session ID:</Text>
              <Input
                value={currentSession.id}
                readOnly
                style={{ width: '100%' }}
              />
              <Button
                size="xs"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(currentSession.id)}
                style={{ marginTop: '4px' }}
              >
                Copy to Share
              </Button>
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Text size="sm">Permissions:</Text>

              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={currentSession.settings.lockLayersForPlayers}
                  onChange={(_e: ChangeEvent<HTMLInputElement>) => {
                    // updateSessionSettings({ lockLayersForPlayers: e.target.checked })
                  }}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <Text size="xs">Lock layers for players</Text>
              </Box>

              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={currentSession.settings.allowAnonymous}
                  onChange={(_e: ChangeEvent<HTMLInputElement>) => {
                    // updateSessionSettings({ allowAnonymous: e.target.checked })
                  }}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <Text size="xs">Allow anonymous users</Text>
              </Box>

              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={currentSession.settings.enableTextChat}
                  onChange={(_e: ChangeEvent<HTMLInputElement>) => {
                    // updateSessionSettings({ enableTextChat: e.target.checked })
                  }}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <Text size="xs">Enable text chat</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  )
}

export default RealTimeCollaborationManager