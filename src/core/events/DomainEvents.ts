/**
 * Domain Events - Type-safe event definitions for the MapMaker application
 * These events represent significant business events that modules can react to
 */

import type { ID, Point, TokenId, MapId, RoundId, EventId } from '@/foundation/types'

// Map domain events
export type MapEvent =
  | { type: 'MAP_LOADED'; payload: { mapId: MapId; name: string } }
  | { type: 'MAP_SAVED'; payload: { mapId: MapId; timestamp: number } }
  | { type: 'MAP_EXPORTED'; payload: { mapId: MapId; format: string; filename: string } }
  | { type: 'MAP_RESIZED'; payload: { mapId: MapId; width: number; height: number } }

// Object domain events
export type ObjectEvent =
  | { type: 'OBJECT_ADDED'; payload: { objectId: ID; objectType: string; position: Point } }
  | { type: 'OBJECT_REMOVED'; payload: { objectId: ID; objectType: string } }
  | { type: 'OBJECT_MOVED'; payload: { objectId: ID; fromPosition: Point; toPosition: Point } }
  | { type: 'OBJECT_SELECTED'; payload: { objectId: ID; multi: boolean } }
  | { type: 'OBJECT_DESELECTED'; payload: { objectId: ID } }
  | { type: 'SELECTION_CLEARED'; payload: {} }

// Token domain events
export type TokenEvent =
  | { type: 'TOKEN_CREATED'; payload: { tokenId: TokenId; position: Point; name: string } }
  | { type: 'TOKEN_ANIMATED'; payload: { tokenId: TokenId; animationType: string; duration: number } }
  | { type: 'TOKEN_SIZE_CHANGED'; payload: { tokenId: TokenId; oldSize: string; newSize: string } }

// Timeline domain events
export type TimelineEvent =
  | { type: 'TIMELINE_CREATED'; payload: { timelineId: string; name: string } }
  | { type: 'TIMELINE_ACTIVATED'; payload: { timelineId: string } }
  | { type: 'TIMELINE_DELETED'; payload: { timelineId: string } }
  | { type: 'COMBAT_STARTED'; payload: { timelineId: string } }
  | { type: 'COMBAT_ENDED'; payload: { timelineId: string } }
  | { type: 'ROUND_ADDED'; payload: { timelineId: string; roundId: string; roundNumber: number } }
  | { type: 'ROUND_REMOVED'; payload: { timelineId: string; roundId: string } }
  | { type: 'ROUND_ADVANCED'; payload: { timelineId: string; fromRound: number; toRound: number } }
  | { type: 'ROUND_STARTED'; payload: { roundId: RoundId; roundNumber: number } }
  | { type: 'ROUND_ENDED'; payload: { roundId: RoundId; roundNumber: number } }
  | { type: 'EVENT_CREATED'; payload: { timelineId: string; roundId: string; eventId: string } }
  | { type: 'EVENT_UPDATED'; payload: { timelineId: string; eventId: string } }
  | { type: 'EVENT_DELETED'; payload: { timelineId: string; eventId: string } }
  | { type: 'EVENT_EXECUTED'; payload: { eventId: EventId; roundId: RoundId; success: boolean } }
  | { type: 'EVENT_QUEUED'; payload: { eventId: EventId; roundId: RoundId; order: number } }
  | { type: 'EVENT_SELECTED'; payload: { timelineId: string; eventIds: string[] } }
  | { type: 'PLAYBACK_STARTED'; payload: { timelineId: string } }
  | { type: 'PLAYBACK_STOPPED'; payload: { timelineId: string } }
  | { type: 'PLAYBACK_SPEED_CHANGED'; payload: { timelineId: string; speed: number } }

// Canvas domain events
export type CanvasEvent =
  | { type: 'CANVAS_INITIALIZED'; payload: { width: number; height: number } }
  | { type: 'CANVAS_ZOOMED'; payload: { scale: number; center: Point } }
  | { type: 'CANVAS_PANNED'; payload: { position: Point; delta: Point } }
  | { type: 'CANVAS_CLICKED'; payload: { position: Point; canvasPosition: Point; button: number } }
  | { type: 'CANVAS_RESIZED'; payload: { width: number; height: number } }

// Tool domain events
export type ToolEvent =
  | { type: 'TOOL_CHANGED'; payload: { oldTool: string; newTool: string } }
  | { type: 'TOOL_ACTIVATED'; payload: { tool: string; options: Record<string, unknown> } }
  | { type: 'TOOL_DEACTIVATED'; payload: { tool: string } }

// Spell domain events
export type SpellEvent =
  | { type: 'SPELL_CAST'; payload: { spellName: string; position: Point; caster?: TokenId } }
  | { type: 'SPELL_EFFECT_STARTED'; payload: { effectId: ID; spellName: string; duration: number } }
  | { type: 'SPELL_EFFECT_ENDED'; payload: { effectId: ID; spellName: string } }

// Union of all domain events
export type DomainEvent =
  | MapEvent
  | ObjectEvent
  | TokenEvent
  | TimelineEvent
  | CanvasEvent
  | ToolEvent
  | SpellEvent

// Event type helpers
export type EventType = DomainEvent['type']
export type EventPayload<T extends EventType> = Extract<DomainEvent, { type: T }>['payload']

// Event creation helpers
export const createMapEvent = <T extends MapEvent['type']>(
  type: T,
  payload: EventPayload<T>
): Extract<MapEvent, { type: T }> => ({ type, payload }) as Extract<MapEvent, { type: T }>

export const createObjectEvent = <T extends ObjectEvent['type']>(
  type: T,
  payload: EventPayload<T>
): Extract<ObjectEvent, { type: T }> => ({ type, payload }) as Extract<ObjectEvent, { type: T }>

export const createTokenEvent = <T extends TokenEvent['type']>(
  type: T,
  payload: EventPayload<T>
): Extract<TokenEvent, { type: T }> => ({ type, payload }) as Extract<TokenEvent, { type: T }>

export const createTimelineEvent = <T extends TimelineEvent['type']>(
  type: T,
  payload: EventPayload<T>
): Extract<TimelineEvent, { type: T }> => ({ type, payload }) as Extract<TimelineEvent, { type: T }>

export const createCanvasEvent = <T extends CanvasEvent['type']>(
  type: T,
  payload: EventPayload<T>
): Extract<CanvasEvent, { type: T }> => ({ type, payload }) as Extract<CanvasEvent, { type: T }>

export const createToolEvent = <T extends ToolEvent['type']>(
  type: T,
  payload: EventPayload<T>
): Extract<ToolEvent, { type: T }> => ({ type, payload }) as Extract<ToolEvent, { type: T }>

export const createSpellEvent = <T extends SpellEvent['type']>(
  type: T,
  payload: EventPayload<T>
): Extract<SpellEvent, { type: T }> => ({ type, payload }) as Extract<SpellEvent, { type: T }>

// Event constants for easy access
export const EVENT_TYPES = {
  // Map events
  MAP_LOADED: 'MAP_LOADED' as const,
  MAP_SAVED: 'MAP_SAVED' as const,
  MAP_EXPORTED: 'MAP_EXPORTED' as const,
  MAP_RESIZED: 'MAP_RESIZED' as const,

  // Object events
  OBJECT_ADDED: 'OBJECT_ADDED' as const,
  OBJECT_REMOVED: 'OBJECT_REMOVED' as const,
  OBJECT_MOVED: 'OBJECT_MOVED' as const,
  OBJECT_SELECTED: 'OBJECT_SELECTED' as const,
  OBJECT_DESELECTED: 'OBJECT_DESELECTED' as const,
  SELECTION_CLEARED: 'SELECTION_CLEARED' as const,

  // Token events
  TOKEN_CREATED: 'TOKEN_CREATED' as const,
  TOKEN_ANIMATED: 'TOKEN_ANIMATED' as const,
  TOKEN_SIZE_CHANGED: 'TOKEN_SIZE_CHANGED' as const,

  // Timeline events
  TIMELINE_CREATED: 'TIMELINE_CREATED' as const,
  TIMELINE_ACTIVATED: 'TIMELINE_ACTIVATED' as const,
  TIMELINE_DELETED: 'TIMELINE_DELETED' as const,
  COMBAT_STARTED: 'COMBAT_STARTED' as const,
  COMBAT_ENDED: 'COMBAT_ENDED' as const,
  ROUND_ADDED: 'ROUND_ADDED' as const,
  ROUND_REMOVED: 'ROUND_REMOVED' as const,
  ROUND_ADVANCED: 'ROUND_ADVANCED' as const,
  ROUND_STARTED: 'ROUND_STARTED' as const,
  ROUND_ENDED: 'ROUND_ENDED' as const,
  EVENT_CREATED: 'EVENT_CREATED' as const,
  EVENT_UPDATED: 'EVENT_UPDATED' as const,
  EVENT_DELETED: 'EVENT_DELETED' as const,
  EVENT_EXECUTED: 'EVENT_EXECUTED' as const,
  EVENT_QUEUED: 'EVENT_QUEUED' as const,
  EVENT_SELECTED: 'EVENT_SELECTED' as const,
  PLAYBACK_STARTED: 'PLAYBACK_STARTED' as const,
  PLAYBACK_STOPPED: 'PLAYBACK_STOPPED' as const,
  PLAYBACK_SPEED_CHANGED: 'PLAYBACK_SPEED_CHANGED' as const,

  // Canvas events
  CANVAS_INITIALIZED: 'CANVAS_INITIALIZED' as const,
  CANVAS_ZOOMED: 'CANVAS_ZOOMED' as const,
  CANVAS_PANNED: 'CANVAS_PANNED' as const,
  CANVAS_CLICKED: 'CANVAS_CLICKED' as const,
  CANVAS_RESIZED: 'CANVAS_RESIZED' as const,

  // Tool events
  TOOL_CHANGED: 'TOOL_CHANGED' as const,
  TOOL_ACTIVATED: 'TOOL_ACTIVATED' as const,
  TOOL_DEACTIVATED: 'TOOL_DEACTIVATED' as const,

  // Spell events
  SPELL_CAST: 'SPELL_CAST' as const,
  SPELL_EFFECT_STARTED: 'SPELL_EFFECT_STARTED' as const,
  SPELL_EFFECT_ENDED: 'SPELL_EFFECT_ENDED' as const
} as const