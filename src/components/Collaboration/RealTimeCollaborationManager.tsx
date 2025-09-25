import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Group, Circle, Text as KonvaText, Rect } from 'react-konva'
import Konva from 'konva'
import useCollaborationStore, { CollaborativeUser, ChatMessage } from '@/store/collaborationStore'
import useMapStore from '@/store/mapStore'
import { Point } from '@/types'
import { Box, Text, Button, Input, Avatar } from '@/components/ui'
import { Users, MessageSquare, Settings, UserPlus, Crown, Eye, EyeOff, Mic, MicOff } from 'lucide-react'

interface RealTimeCollaborationManagerProps {
  stageRef?: React.RefObject<Konva.Stage>
  isActive: boolean
}

export const RealTimeCollaborationManager: React.FC<RealTimeCollaborationManagerProps> = ({
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
    connect,
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
    updateUserRole,
    getUsersInSession
  } = useCollaborationStore()

  const { selectedObjects, currentMap } = useMapStore()

  // Handle cursor movement
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
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
  const handleChatSubmit = useCallback((e: React.FormEvent) => {
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
  const handleChatInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
        css={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '$2',
          zIndex: 1000
        }}
      >
        {connectionStatus === 'disconnected' ? (
          <Box css={{ display: 'flex', gap: '$2' }}>
            <Button onClick={handleStartSession}>
              <Crown size={16} />
              Host Session
            </Button>
            <Button onClick={handleJoinSession} variant="outline">
              <Users size={16} />
              Join Session
            </Button>
          </Box>
        ) : (
          <Box css={{ display: 'flex', gap: '$2' }}>
            {/* Connection Status */}
            <Box
              css={{
                padding: '$2 $3',
                backgroundColor: connectionStatus === 'connected' ? '$success' : '$warning',
                borderRadius: '$sm',
                color: 'white',
                fontSize: '$xs',
                display: 'flex',
                alignItems: 'center',
                gap: '$1'
              }}
            >
              <Circle
                css={{
                  width: 8,
                  height: 8,
                  backgroundColor: 'currentColor',
                  borderRadius: '50%'
                }}
              />
              {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
            </Box>

            {/* Users List Toggle */}
            <Button
              variant={showUserList ? 'default' : 'outline'}
              onClick={() => setShowUserList(!showUserList)}
            >
              <Users size={16} />
              {onlineUsers.length}
            </Button>

            {/* Chat Toggle */}
            <Button
              variant={showChat ? 'default' : 'outline'}
              onClick={() => {
                setShowChat(!showChat)
                if (!showChat) markMessagesAsRead()
              }}
            >
              <MessageSquare size={16} />
              {unreadMessages > 0 && (
                <Box
                  css={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: '$error',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '$xs'
                  }}
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </Box>
              )}
            </Button>

            {/* Settings Toggle */}
            {isHost && (
              <Button
                variant={showSettings ? 'default' : 'outline'}
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings size={16} />
              </Button>
            )}

            {/* Leave Session */}
            <Button onClick={disconnect} variant="outline">
              Leave
            </Button>
          </Box>
        )}
      </Box>

      {/* Users List Panel */}
      {showUserList && connectionStatus === 'connected' && (
        <Box
          css={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            width: 300,
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
            Online Users ({onlineUsers.length})
          </Text>

          {onlineUsers.map(user => (
            <Box
              key={user.id}
              css={{
                display: 'flex',
                alignItems: 'center',
                gap: '$3',
                padding: '$2',
                marginBottom: '$2',
                backgroundColor: user.id === currentUser?.id ? '$gray800' : 'transparent',
                borderRadius: '$sm'
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
                <Text size="sm" weight="medium">
                  {user.name}
                  {user.id === currentUser?.id && ' (You)'}
                </Text>
                <Text size="xs" color="gray400">
                  {user.role === 'gm' ? 'Game Master' :
                   user.role === 'player' ? 'Player' : 'Observer'}
                </Text>
              </Box>

              {user.cursor?.visible && (
                <Eye size={14} color="var(--colors-success)" />
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
              css={{ width: '100%', marginTop: '$2' }}
              onClick={() => {
                const email = prompt('Enter email to invite:')
                if (email) inviteUser(email, 'player')
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
          css={{
            position: 'fixed',
            bottom: 80,
            right: showUserList ? 340 : 20,
            width: 350,
            height: 400,
            backgroundColor: '$dndBlack',
            border: '1px solid $gray800',
            borderRadius: '$md',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1001,
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <Box
            css={{
              padding: '$3',
              borderBottom: '1px solid $gray800',
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
            css={{
              flex: 1,
              padding: '$2',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '$2'
            }}
          >
            {chatMessages.map(message => {
              const user = connectedUsers.get(message.userId)
              const isOwn = message.userId === currentUser?.id

              return (
                <Box
                  key={message.id}
                  css={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '$2',
                    opacity: message.type === 'system' ? 0.7 : 1
                  }}
                >
                  {!isOwn && user && (
                    <Avatar
                      size="xs"
                      css={{
                        backgroundColor: user.color,
                        color: 'white',
                        fontSize: '$xs'
                      }}
                    >
                      {user.name.charAt(0)}
                    </Avatar>
                  )}

                  <Box css={{ flex: 1, minWidth: 0 }}>
                    <Box css={{ display: 'flex', alignItems: 'center', gap: '$1', marginBottom: '$1' }}>
                      <Text
                        size="xs"
                        weight="medium"
                        css={{ color: user?.color || '$gray400' }}
                      >
                        {message.userName}
                      </Text>
                      <Text size="xs" color="gray500">
                        {message.timestamp.toLocaleTimeString()}
                      </Text>
                    </Box>

                    {message.type === 'dice' ? (
                      <Box
                        css={{
                          padding: '$2',
                          backgroundColor: '$gray800',
                          borderRadius: '$sm',
                          border: '1px solid $success'
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
                      <Text size="sm" css={{ wordBreak: 'break-word' }}>
                        {message.message}
                      </Text>
                    )}
                  </Box>
                </Box>
              )
            })}

            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <Box css={{ display: 'flex', alignItems: 'center', gap: '$1', opacity: 0.7 }}>
                <Text size="xs" color="gray400">
                  {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </Text>
              </Box>
            )}
          </Box>

          {/* Chat Input */}
          <Box css={{ padding: '$3', borderTop: '1px solid $gray800' }}>
            <form onSubmit={handleChatSubmit}>
              <Input
                value={chatInput}
                onChange={handleChatInputChange}
                placeholder="Type a message... (/roll 1d20 for dice)"
                fullWidth
                size="sm"
              />
            </form>
            <Text size="xs" color="gray500" css={{ marginTop: '$1' }}>
              Use /roll [dice] for dice rolls (e.g., /roll 1d20+5)
            </Text>
          </Box>
        </Box>
      )}

      {/* Settings Panel */}
      {showSettings && isHost && connectionStatus === 'connected' && currentSession && (
        <Box
          css={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            width: 300,
            backgroundColor: '$dndBlack',
            border: '1px solid $gray800',
            borderRadius: '$md',
            padding: '$4',
            zIndex: 1001
          }}
        >
          <Text size="lg" weight="semibold" css={{ marginBottom: '$3' }}>
            Session Settings
          </Text>

          <Box css={{ display: 'flex', flexDirection: 'column', gap: '$3' }}>
            <Box>
              <Text size="sm" css={{ marginBottom: '$2' }}>Session Name:</Text>
              <Input
                value={currentSession.name}
                onChange={(e) => {
                  // updateSessionSettings({ name: e.target.value })
                }}
                size="sm"
                fullWidth
              />
            </Box>

            <Box>
              <Text size="sm" css={{ marginBottom: '$2' }}>Session ID:</Text>
              <Input
                value={currentSession.id}
                readOnly
                size="sm"
                fullWidth
              />
              <Button
                size="xs"
                css={{ marginTop: '$1' }}
                onClick={() => navigator.clipboard.writeText(currentSession.id)}
              >
                Copy to Share
              </Button>
            </Box>

            <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
              <Text size="sm">Permissions:</Text>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={currentSession.settings.lockLayersForPlayers}
                  onChange={(e) => {
                    // updateSessionSettings({ lockLayersForPlayers: e.target.checked })
                  }}
                />
                <Text size="xs">Lock layers for players</Text>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={currentSession.settings.allowAnonymous}
                  onChange={(e) => {
                    // updateSessionSettings({ allowAnonymous: e.target.checked })
                  }}
                />
                <Text size="xs">Allow anonymous users</Text>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={currentSession.settings.enableTextChat}
                  onChange={(e) => {
                    // updateSessionSettings({ enableTextChat: e.target.checked })
                  }}
                />
                <Text size="xs">Enable text chat</Text>
              </label>
            </Box>
          </Box>
        </Box>
      )}
    </>
  )
}

export default RealTimeCollaborationManager