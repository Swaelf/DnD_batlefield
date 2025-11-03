import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { immer } from 'zustand/middleware/immer'

export type UserRole = 'gm' | 'player' | 'observer'
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

export interface CollaborativeUser {
  id: string
  name: string
  role: UserRole
  avatar?: string
  color: string
  isOnline: boolean
  lastSeen: Date
  cursor?: {
    x: number
    y: number
    visible: boolean
  }
  selection?: {
    objectIds: string[]
    tool?: string
  }
  permissions: {
    canEdit: boolean
    canAddObjects: boolean
    canDeleteObjects: boolean
    canManageLayers: boolean
    canExport: boolean
    canInvite: boolean
  }
}

export interface CollaborationOperation {
  id: string
  type: 'object:create' | 'object:update' | 'object:delete' | 'object:move' | 'map:update' | 'layer:update'
  userId: string
  timestamp: Date
  data: any
  mapId: string
  acknowledged: boolean
  conflictResolved?: boolean
}

export interface CollaborationSession {
  id: string
  mapId: string
  name: string
  createdBy: string
  createdAt: Date
  isActive: boolean
  users: CollaborativeUser[]
  maxUsers: number
  settings: {
    allowAnonymous: boolean
    requireApproval: boolean
    lockLayersForPlayers: boolean
    shareViewport: boolean
    enableVoiceChat: boolean
    enableTextChat: boolean
  }
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: Date
  type: 'text' | 'system' | 'dice' | 'whisper'
  targetUserId?: string // For whispers
  diceRoll?: {
    formula: string
    result: number
    breakdown: string
  }
}

export interface CollaborationStore {
  // Connection state
  connectionStatus: ConnectionStatus
  reconnectAttempts: number
  lastPing: Date | null

  // Session management
  currentSession: CollaborationSession | null
  isHost: boolean
  currentUser: CollaborativeUser | null

  // Real-time data
  operations: CollaborationOperation[]
  pendingOperations: CollaborationOperation[]
  conflictedOperations: CollaborationOperation[]

  // User interactions
  connectedUsers: Map<string, CollaborativeUser>
  userCursors: Map<string, { x: number; y: number; visible: boolean }>
  userSelections: Map<string, string[]>

  // Chat system
  chatMessages: ChatMessage[]
  unreadMessages: number
  isTyping: Map<string, boolean>

  // Permissions & roles
  rolePermissions: Record<UserRole, CollaborativeUser['permissions']>

  // Actions - Connection Management
  connect: (sessionId: string, userId: string) => Promise<void>
  disconnect: () => void
  reconnect: () => Promise<void>
  setConnectionStatus: (status: ConnectionStatus) => void

  // Actions - Session Management
  createSession: (mapId: string, settings: Partial<CollaborationSession['settings']>) => Promise<CollaborationSession>
  joinSession: (sessionId: string, userInfo: Partial<CollaborativeUser>) => Promise<void>
  leaveSession: () => void
  updateSessionSettings: (settings: Partial<CollaborationSession['settings']>) => void
  inviteUser: (email: string, role: UserRole) => Promise<void>
  removeUser: (userId: string) => void
  updateUserRole: (userId: string, role: UserRole) => void

  // Actions - Real-time Operations
  submitOperation: (operation: Omit<CollaborationOperation, 'id' | 'timestamp' | 'acknowledged'>) => void
  acknowledgeOperation: (operationId: string) => void
  resolveConflict: (operationId: string, resolution: 'accept' | 'reject' | 'merge') => void
  applyOperation: (operation: CollaborationOperation) => void

  // Actions - User Interactions
  updateCursor: (position: { x: number; y: number; visible: boolean }) => void
  updateSelection: (objectIds: string[]) => void
  broadcastUserAction: (action: string, data?: any) => void

  // Actions - Chat System
  sendMessage: (message: string, type?: ChatMessage['type'], targetUserId?: string) => void
  sendDiceRoll: (formula: string) => void
  setTyping: (isTyping: boolean) => void
  markMessagesAsRead: () => void
  clearChat: () => void

  // Actions - Conflict Resolution
  detectConflict: (operation: CollaborationOperation) => boolean
  getConflictingOperations: (operation: CollaborationOperation) => CollaborationOperation[]
  mergeOperations: (operations: CollaborationOperation[]) => CollaborationOperation

  // Utility functions
  getUserById: (userId: string) => CollaborativeUser | undefined
  hasPermission: (userId: string, permission: keyof CollaborativeUser['permissions']) => boolean
  getOnlineUsers: () => CollaborativeUser[]
  getUsersInSession: () => CollaborativeUser[]
}

// Default role permissions
const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, CollaborativeUser['permissions']> = {
  gm: {
    canEdit: true,
    canAddObjects: true,
    canDeleteObjects: true,
    canManageLayers: true,
    canExport: true,
    canInvite: true
  },
  player: {
    canEdit: true,
    canAddObjects: true,
    canDeleteObjects: false,
    canManageLayers: false,
    canExport: false,
    canInvite: false
  },
  observer: {
    canEdit: false,
    canAddObjects: false,
    canDeleteObjects: false,
    canManageLayers: false,
    canExport: false,
    canInvite: false
  }
}

// User colors for cursor and selection visualization
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

let colorIndex = 0

const getNextUserColor = (): string => {
  const color = USER_COLORS[colorIndex % USER_COLORS.length]
  colorIndex++
  return color
}

export const useCollaborationStore = create<CollaborationStore>()(
  immer((set, get) => ({
  // Initial state
  connectionStatus: 'disconnected',
  reconnectAttempts: 0,
  lastPing: null,
  currentSession: null,
  isHost: false,
  currentUser: null,
  operations: [],
  pendingOperations: [],
  conflictedOperations: [],
  connectedUsers: new Map(),
  userCursors: new Map(),
  userSelections: new Map(),
  chatMessages: [],
  unreadMessages: 0,
  isTyping: new Map(),
  rolePermissions: DEFAULT_ROLE_PERMISSIONS,

  // Connection Management
  connect: async (_sessionId: string, userId: string) => {
    set({ connectionStatus: 'connecting' })

    try {
      // Mock WebSocket connection for now
      // In production, this would establish WebSocket connection

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock successful connection
      const mockUser: CollaborativeUser = {
        id: userId,
        name: `User ${userId.slice(-4)}`,
        role: 'player',
        color: getNextUserColor(),
        isOnline: true,
        lastSeen: new Date(),
        permissions: DEFAULT_ROLE_PERMISSIONS.player
      }

      set(state => {
        state.connectionStatus = 'connected'
        state.currentUser = mockUser
        state.connectedUsers.set(userId, mockUser)
        state.reconnectAttempts = 0
        state.lastPing = new Date()
      })

    } catch (error) {
      console.error('Failed to connect:', error)
      set({ connectionStatus: 'error' })
    }
  },

  disconnect: () => {
    set(state => {
      state.connectionStatus = 'disconnected'
      state.currentSession = null
      state.currentUser = null
      state.connectedUsers.clear()
      state.userCursors.clear()
      state.userSelections.clear()
      state.operations = []
      state.pendingOperations = []
      state.chatMessages = []
      state.unreadMessages = 0
      state.isTyping.clear()
    })
  },

  reconnect: async () => {
    const { currentSession, currentUser } = get()
    if (!currentSession || !currentUser) return

    set(state => {
      state.connectionStatus = 'reconnecting'
      state.reconnectAttempts += 1
    })

    try {
      await get().connect(currentSession.id, currentUser.id)
    } catch (error) {
      console.error('Reconnection failed:', error)
      set({ connectionStatus: 'error' })
    }
  },

  setConnectionStatus: (status: ConnectionStatus) => {
    set({ connectionStatus: status })
  },

  // Session Management
  createSession: async (mapId: string, settings: Partial<CollaborationSession['settings']>) => {
    const sessionId = uuidv4()
    const userId = uuidv4()

    const session: CollaborationSession = {
      id: sessionId,
      mapId,
      name: `Map Session - ${new Date().toLocaleTimeString()}`,
      createdBy: userId,
      createdAt: new Date(),
      isActive: true,
      users: [],
      maxUsers: 10,
      settings: {
        allowAnonymous: true,
        requireApproval: false,
        lockLayersForPlayers: true,
        shareViewport: false,
        enableVoiceChat: false,
        enableTextChat: true,
        ...settings
      }
    }

    const hostUser: CollaborativeUser = {
      id: userId,
      name: 'Game Master',
      role: 'gm',
      color: getNextUserColor(),
      isOnline: true,
      lastSeen: new Date(),
      permissions: DEFAULT_ROLE_PERMISSIONS.gm
    }

    set(state => {
      state.currentSession = session
      state.isHost = true
      state.currentUser = hostUser
      state.connectedUsers.set(userId, hostUser)
    })

    return session
  },

  joinSession: async (sessionId: string, userInfo: Partial<CollaborativeUser>) => {
    await get().connect(sessionId, userInfo.id || uuidv4())
  },

  leaveSession: () => {
    get().disconnect()
  },

  updateSessionSettings: (settings: Partial<CollaborationSession['settings']>) => {
    set(state => {
      if (state.currentSession) {
        Object.assign(state.currentSession.settings, settings)
      }
    })
  },

  inviteUser: async () => {
    // Mock implementation - would send email invitation
    // In production: await sendInvitationEmail(email, role)
  },

  removeUser: (userId: string) => {
    set(state => {
      state.connectedUsers.delete(userId)
      state.userCursors.delete(userId)
      state.userSelections.delete(userId)
      state.isTyping.delete(userId)
    })
  },

  updateUserRole: (userId: string, role: UserRole) => {
    set(state => {
      const user = state.connectedUsers.get(userId)
      if (user) {
        user.role = role
        user.permissions = DEFAULT_ROLE_PERMISSIONS[role]
      }
    })
  },

  // Real-time Operations
  submitOperation: (operation: Omit<CollaborationOperation, 'id' | 'timestamp' | 'acknowledged'>) => {
    const fullOperation: CollaborationOperation = {
      ...operation,
      id: uuidv4(),
      timestamp: new Date(),
      acknowledged: false
    }

    set(state => {
      state.pendingOperations.push(fullOperation)
    })

    // Mock operation submission - would send via WebSocket
    setTimeout(() => {
      get().acknowledgeOperation(fullOperation.id)
    }, 100)
  },

  acknowledgeOperation: (operationId: string) => {
    set(state => {
      const operationIndex = state.pendingOperations.findIndex(op => op.id === operationId)
      if (operationIndex >= 0) {
        const [operation] = state.pendingOperations.splice(operationIndex, 1)
        operation.acknowledged = true
        state.operations.push(operation)
      }
    })
  },

  resolveConflict: (operationId: string, resolution: 'accept' | 'reject' | 'merge') => {
    set(state => {
      const conflictIndex = state.conflictedOperations.findIndex(op => op.id === operationId)
      if (conflictIndex >= 0) {
        const [operation] = state.conflictedOperations.splice(conflictIndex, 1)

        if (resolution === 'accept') {
          operation.conflictResolved = true
          state.operations.push(operation)
        }
        // 'reject' removes operation, 'merge' would combine with other operations
      }
    })
  },

  applyOperation: () => {
    // This would integrate with mapStore to apply the operation
    // In production: apply operation to map based on operation.type and operation.data
  },

  // User Interactions
  updateCursor: (position: { x: number; y: number; visible: boolean }) => {
    const { currentUser } = get()
    if (!currentUser) return

    set(state => {
      state.userCursors.set(currentUser.id, position)
      const user = state.connectedUsers.get(currentUser.id)
      if (user) {
        user.cursor = position
      }
    })
  },

  updateSelection: (objectIds: string[]) => {
    const { currentUser } = get()
    if (!currentUser) return

    set(state => {
      state.userSelections.set(currentUser.id, objectIds)
      const user = state.connectedUsers.get(currentUser.id)
      if (user) {
        user.selection = { objectIds }
      }
    })
  },

  broadcastUserAction: () => {
    // Mock broadcast - would send via WebSocket
    // In production: websocket.send({ action, data })
  },

  // Chat System
  sendMessage: (message: string, type: ChatMessage['type'] = 'text', targetUserId?: string) => {
    const { currentUser } = get()
    if (!currentUser) return

    const chatMessage: ChatMessage = {
      id: uuidv4(),
      userId: currentUser.id,
      userName: currentUser.name,
      message,
      timestamp: new Date(),
      type,
      targetUserId
    }

    set(state => {
      state.chatMessages.push(chatMessage)
      if (targetUserId !== currentUser.id) {
        state.unreadMessages += 1
      }
    })
  },

  sendDiceRoll: (formula: string) => {
    // Mock dice roll calculation
    const result = Math.floor(Math.random() * 20) + 1
    const breakdown = `1d20: ${result}`

    const { currentUser } = get()
    if (!currentUser) return

    const diceMessage: ChatMessage = {
      id: uuidv4(),
      userId: currentUser.id,
      userName: currentUser.name,
      message: `rolled ${formula}`,
      timestamp: new Date(),
      type: 'dice',
      diceRoll: { formula, result, breakdown }
    }

    set(state => {
      state.chatMessages.push(diceMessage)
    })
  },

  setTyping: (isTyping: boolean) => {
    const { currentUser } = get()
    if (!currentUser) return

    set(state => {
      state.isTyping.set(currentUser.id, isTyping)
    })
  },

  markMessagesAsRead: () => {
    set({ unreadMessages: 0 })
  },

  clearChat: () => {
    set({ chatMessages: [], unreadMessages: 0 })
  },

  // Conflict Resolution
  detectConflict: (operation: CollaborationOperation) => {
    const { operations } = get()

    return operations.some(existing =>
      existing.type === operation.type &&
      existing.data?.objectId === operation.data?.objectId &&
      Math.abs(existing.timestamp.getTime() - operation.timestamp.getTime()) < 1000
    )
  },

  getConflictingOperations: (operation: CollaborationOperation) => {
    const { operations } = get()

    return operations.filter(existing =>
      existing.type === operation.type &&
      existing.data?.objectId === operation.data?.objectId &&
      existing.id !== operation.id
    )
  },

  mergeOperations: (operations: CollaborationOperation[]) => {
    // Mock merge - would implement operational transform
    return operations[operations.length - 1]
  },

  // Utility functions
  getUserById: (userId: string) => {
    return get().connectedUsers.get(userId)
  },

  hasPermission: (userId: string, permission: keyof CollaborativeUser['permissions']) => {
    const user = get().connectedUsers.get(userId)
    return user?.permissions[permission] || false
  },

  getOnlineUsers: () => {
    return Array.from(get().connectedUsers.values()).filter(user => user.isOnline)
  },

  getUsersInSession: () => {
    return Array.from(get().connectedUsers.values())
  }
})))

export default useCollaborationStore