import type { UnifiedAction } from './unifiedAction'

// Enhanced timeline types that support unified actions
export type UnifiedTimeline = {
  id: string
  mapId: string
  rounds: UnifiedRound[]
  currentRound: number
  isActive: boolean
  history: UnifiedRound[] // Completed rounds
}

export type UnifiedRound = {
  id: string
  number: number
  name?: string // Optional name like "Ambush!" or "Dragon arrives"
  timestamp: number
  events: UnifiedRoundEvent[]
  executed: boolean
}

// Enhanced round event that can contain either legacy or unified actions
export type UnifiedRoundEvent = {
  id: string
  roundNumber: number
  tokenId: string
  type: 'unified' | 'legacy'
  action?: UnifiedAction  // New unified action data
  legacyData?: any       // Legacy event data for backward compatibility
  executed: boolean
  order?: number // For ordering events within a round
}

// Conversion utilities between legacy and unified formats
export type LegacyEventConverter = {
  // Convert legacy spell event to unified action
  convertSpellEvent: (spellData: any) => UnifiedAction

  // Convert legacy attack event to unified action
  convertAttackEvent: (attackData: any) => UnifiedAction

  // Convert legacy interaction event to unified action
  convertInteractionEvent: (interactionData: any) => UnifiedAction

  // Convert legacy move event to unified action (will be handled separately)
  convertMoveEvent: (moveData: any) => UnifiedAction
}

// Helper functions for the transition period
export const createUnifiedRoundEvent = (
  tokenId: string,
  action: UnifiedAction,
  roundNumber: number,
  order?: number
): UnifiedRoundEvent => ({
  id: action.id,
  roundNumber,
  tokenId,
  type: 'unified',
  action,
  executed: false,
  order
})

export const isUnifiedEvent = (event: UnifiedRoundEvent): event is UnifiedRoundEvent & { action: UnifiedAction } => {
  return event.type === 'unified' && event.action !== undefined
}

export const isLegacyEvent = (event: UnifiedRoundEvent): event is UnifiedRoundEvent & { legacyData: any } => {
  return event.type === 'legacy' && event.legacyData !== undefined
}