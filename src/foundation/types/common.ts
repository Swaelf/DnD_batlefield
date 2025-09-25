/**
 * Common foundation types used across the application
 * These are the basic building blocks for type safety
 */

// Branded types for better type safety
export type ID = string & { readonly __brand: 'ID' }
export type TokenId = string & { readonly __brand: 'TokenId' }
export type MapId = string & { readonly __brand: 'MapId' }
export type RoundId = string & { readonly __brand: 'RoundId' }
export type EventId = string & { readonly __brand: 'EventId' }

export type Timestamp = number & { readonly __brand: 'Timestamp' }
export type Color = string & { readonly __brand: 'Color' }

// Utility types for working with branded types
export const createId = (value: string): ID => value as ID
export const createTokenId = (value: string): TokenId => value as TokenId
export const createMapId = (value: string): MapId => value as MapId
export const createRoundId = (value: string): RoundId => value as RoundId
export const createEventId = (value: string): EventId => value as EventId
export const createTimestamp = (value: number = Date.now()): Timestamp => value as Timestamp
export const createColor = (value: string): Color => value as Color

// Common discriminated union patterns
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'fulfilled'; data: T }
  | { status: 'rejected'; error: Error }

// Common configuration types
export type BaseConfig = {
  readonly enabled: boolean
  readonly debug?: boolean
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & Pick<Required<T>, K>
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// Event handling types
export type EventHandler<T = unknown> = (data: T) => void
export type CleanupFunction = () => void