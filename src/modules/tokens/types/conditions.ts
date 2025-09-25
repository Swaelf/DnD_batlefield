/**
 * D&D 5e Conditions Types - Complete condition system with visual indicators
 */

// D&D 5e condition names
export type ConditionType =
  | 'blinded'
  | 'charmed'
  | 'deafened'
  | 'frightened'
  | 'grappled'
  | 'incapacitated'
  | 'invisible'
  | 'paralyzed'
  | 'petrified'
  | 'poisoned'
  | 'prone'
  | 'restrained'
  | 'stunned'
  | 'unconscious'

// Condition visual properties
export interface ConditionVisual {
  readonly name: string
  readonly description: string
  readonly color: string
  readonly icon: string
  readonly opacity?: number
  readonly animation?: 'pulse' | 'blink' | 'spin' | 'none'
  readonly priority: number // for stacking order
}

// Condition effect data
export interface ConditionEffect {
  readonly type: ConditionType
  readonly source?: string // what caused the condition
  readonly duration?: number // rounds remaining (-1 = indefinite)
  readonly level?: number // for conditions with levels
  readonly notes?: string
  readonly appliedAt: Date
  readonly appliedBy?: string // who applied it
}

// Token condition state
export interface TokenConditionState {
  readonly activeConditions: readonly ConditionEffect[]
  readonly immunities: readonly ConditionType[]
  readonly resistances: readonly ConditionType[]
  readonly vulnerabilities: readonly ConditionType[]
}

// Condition application result
export interface ConditionApplicationResult {
  readonly success: boolean
  readonly applied: readonly ConditionType[]
  readonly blocked: readonly ConditionType[] // due to immunity
  readonly replaced: readonly ConditionType[] // upgraded/downgraded
  readonly warnings: readonly string[]
}

// Condition removal result
export interface ConditionRemovalResult {
  readonly success: boolean
  readonly removed: readonly ConditionType[]
  readonly remaining: readonly ConditionType[]
  readonly warnings: readonly string[]
}

// Condition interaction rules
export interface ConditionInteraction {
  readonly primary: ConditionType
  readonly secondary: ConditionType
  readonly interaction: 'blocks' | 'replaces' | 'stacks' | 'upgrades' | 'downgrades'
  readonly description: string
}

// Condition validation rules
export interface ConditionValidation {
  readonly condition: ConditionType
  readonly canStack: boolean
  readonly maxStacks?: number
  readonly conflicts: readonly ConditionType[]
  readonly prerequisites?: readonly ConditionType[]
  readonly automaticRemoval?: readonly ConditionType[] // conditions that remove this one
}

// Condition display configuration
export interface ConditionDisplayConfig {
  readonly showIcons: boolean
  readonly showText: boolean
  readonly maxVisible: number
  readonly stackDirection: 'horizontal' | 'vertical' | 'grid'
  readonly iconSize: number
  readonly spacing: number
  readonly opacity: number
  readonly enableAnimations: boolean
}

// Condition manager state
export interface ConditionManagerState {
  readonly displayConfig: ConditionDisplayConfig
  readonly knownConditions: Map<ConditionType, ConditionVisual>
  readonly interactions: readonly ConditionInteraction[]
  readonly validations: Map<ConditionType, ConditionValidation>
  readonly customConditions: Map<string, ConditionVisual>
}

// Custom condition definition
export interface CustomCondition {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly visual: ConditionVisual
  readonly validation: ConditionValidation
  readonly createdBy: string
  readonly createdAt: Date
  readonly isOfficial: boolean
}

// Condition event for logging/history
export interface ConditionEvent {
  readonly type: 'applied' | 'removed' | 'expired' | 'blocked'
  readonly condition: ConditionType
  readonly tokenId: string
  readonly source?: string
  readonly appliedBy?: string
  readonly timestamp: Date
  readonly round?: number
  readonly turn?: number
}

// Bulk condition operations
export interface BulkConditionOperation {
  readonly operation: 'apply' | 'remove' | 'toggle'
  readonly conditions: readonly ConditionType[]
  readonly tokenIds: readonly string[]
  readonly source?: string
  readonly duration?: number
}