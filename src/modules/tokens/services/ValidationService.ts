/**
 * Validation Service - D&D 5e rule validation and compliance checking
 */

import type {
  Token,
  TokenValidationResult,
  TokenSize,
  ConditionType,
  ConditionApplicationResult,
  ConditionRemovalResult,
  ConditionEffect
} from '../types'
import {
  TOKEN_SIZE_GRID_MAP,
  isValidTokenSize,
  CONDITION_VALIDATIONS,
  CONDITION_INTERACTIONS,
  isValidCondition,
  doConditionsConflict,
  getConditionInteraction
} from '../constants'

export interface ValidationConfig {
  readonly enableDNDValidation: boolean
  readonly enforceOfficialRules: boolean
  readonly allowCustomConditions: boolean
  readonly strictSizeValidation: boolean
  readonly validateHitPoints: boolean
  readonly validateArmorClass: boolean
  readonly validateSpeed: boolean
}

export class ValidationService {
  private static instance: ValidationService | null = null

  private config: ValidationConfig = {
    enableDNDValidation: true,
    enforceOfficialRules: false, // Warning vs error
    allowCustomConditions: true,
    strictSizeValidation: true,
    validateHitPoints: true,
    validateArmorClass: true,
    validateSpeed: true
  }

  private constructor() {}

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService()
    }
    return ValidationService.instance
  }

  /**
   * Validate complete token
   */
  validateToken(token: Token): TokenValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic validation
    this.validateBasicProperties(token, errors, warnings)

    // D&D specific validation if enabled
    if (this.config.enableDNDValidation) {
      this.validateDNDProperties(token, errors, warnings)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      dndCompliant: this.config.enableDNDValidation ? warnings.length === 0 : true
    }
  }

  /**
   * Validate basic token properties
   */
  private validateBasicProperties(token: Token, errors: string[], warnings: string[]): void {
    // Name validation
    if (!token.name || !token.name.trim()) {
      errors.push('Token name cannot be empty')
    } else if (token.name.length > 100) {
      warnings.push('Token name is very long (>100 characters)')
    }

    // Size validation
    if (this.config.strictSizeValidation && !isValidTokenSize(token.size)) {
      errors.push(`Invalid token size: ${token.size}`)
    }

    // Color validation
    if (!this.isValidHexColor(token.color)) {
      errors.push('Token color must be a valid hex color (e.g., #FF0000)')
    }

    if (token.borderColor && !this.isValidHexColor(token.borderColor)) {
      errors.push('Border color must be a valid hex color')
    }

    // Opacity validation
    if (token.opacity < 0 || token.opacity > 1) {
      errors.push('Token opacity must be between 0 and 1')
    }

    // Border width validation
    if (token.borderWidth !== undefined && token.borderWidth < 0) {
      errors.push('Border width cannot be negative')
    }

    // Layer validation
    if (token.layer < 0) {
      errors.push('Layer must be non-negative')
    }

    // Rotation validation
    if (token.rotation < -360 || token.rotation > 360) {
      warnings.push('Rotation is outside typical range (-360° to 360°)')
    }

    // Label validation
    if (token.label) {
      if (token.label.fontSize <= 0) {
        errors.push('Label font size must be positive')
      }
      if (token.label.offset < 0) {
        errors.push('Label offset cannot be negative')
      }
      if (!this.isValidHexColor(token.label.color)) {
        errors.push('Label color must be a valid hex color')
      }
    }
  }

  /**
   * Validate D&D 5e specific properties
   */
  private validateDNDProperties(token: Token, errors: string[], warnings: string[]): void {
    // Hit points validation
    if (this.config.validateHitPoints && token.hitPoints) {
      this.validateHitPoints(token.hitPoints, errors, warnings)
    }

    // Armor class validation
    if (this.config.validateArmorClass && token.armorClass !== undefined) {
      this.validateArmorClass(token.armorClass, errors, warnings)
    }

    // Speed validation
    if (this.config.validateSpeed && token.speed !== undefined) {
      this.validateSpeed(token.speed, errors, warnings)
    }

    // Initiative validation
    if (token.initiative !== undefined) {
      this.validateInitiative(token.initiative, errors, warnings)
    }

    // Conditions validation
    if (token.conditions.length > 0) {
      this.validateConditions(token.conditions, errors, warnings)
    }

    // Size-specific validations
    this.validateSizeSpecificRules(token, errors, warnings)
  }

  /**
   * Validate hit points
   */
  private validateHitPoints(
    hitPoints: NonNullable<Token['hitPoints']>,
    errors: string[],
    warnings: string[]
  ): void {
    if (hitPoints.maximum <= 0) {
      errors.push('Maximum hit points must be positive')
    }

    if (hitPoints.current < 0) {
      errors.push('Current hit points cannot be negative')
    }

    if (hitPoints.temporary < 0) {
      errors.push('Temporary hit points cannot be negative')
    }

    if (hitPoints.current > hitPoints.maximum + hitPoints.temporary) {
      errors.push('Current HP cannot exceed maximum + temporary HP')
    }

    // D&D 5e typical ranges
    if (this.config.enforceOfficialRules) {
      if (hitPoints.maximum > 400) {
        warnings.push('Very high hit points for D&D 5e (>400)')
      }
      if (hitPoints.temporary > 50) {
        warnings.push('Very high temporary hit points (>50)')
      }
    }
  }

  /**
   * Validate armor class
   */
  private validateArmorClass(armorClass: number, errors: string[], warnings: string[]): void {
    if (armorClass < 1) {
      errors.push('Armor class must be at least 1')
    }

    if (armorClass > 30) {
      errors.push('Armor class cannot exceed 30')
    }

    // D&D 5e typical ranges
    if (this.config.enforceOfficialRules) {
      if (armorClass < 8) {
        warnings.push('Very low armor class for D&D 5e (<8)')
      }
      if (armorClass > 25) {
        warnings.push('Very high armor class for D&D 5e (>25)')
      }
    }
  }

  /**
   * Validate speed
   */
  private validateSpeed(speed: number, errors: string[], warnings: string[]): void {
    if (speed < 0) {
      errors.push('Speed cannot be negative')
    }

    if (speed > 200) {
      warnings.push('Very high speed for D&D 5e (>200 feet)')
    }

    // D&D 5e speeds are typically multiples of 5
    if (this.config.enforceOfficialRules && speed > 0 && speed % 5 !== 0) {
      warnings.push('D&D 5e speeds are typically multiples of 5 feet')
    }

    // Common D&D speeds
    const commonSpeeds = [0, 25, 30, 40, 50, 60]
    if (this.config.enforceOfficialRules && speed > 0 && !commonSpeeds.includes(speed)) {
      warnings.push('Uncommon speed for D&D 5e (common: 25, 30, 40, 50, 60 feet)')
    }
  }

  /**
   * Validate initiative
   */
  private validateInitiative(initiative: number, errors: string[], warnings: string[]): void {
    if (initiative < -10 || initiative > 50) {
      warnings.push('Initiative outside typical range (-10 to +50)')
    }
  }

  /**
   * Validate conditions
   */
  private validateConditions(conditions: readonly string[], errors: string[], warnings: string[]): void {
    const validConditions: string[] = []

    for (const condition of conditions) {
      if (!isValidCondition(condition)) {
        if (this.config.allowCustomConditions) {
          warnings.push(`Custom condition: ${condition}`)
          validConditions.push(condition)
        } else {
          errors.push(`Invalid D&D 5e condition: ${condition}`)
        }
      } else {
        validConditions.push(condition)
      }
    }

    // Check for conflicting conditions
    for (let i = 0; i < validConditions.length; i++) {
      for (let j = i + 1; j < validConditions.length; j++) {
        const condition1 = validConditions[i]
        const condition2 = validConditions[j]

        if (isValidCondition(condition1) && isValidCondition(condition2)) {
          if (doConditionsConflict(condition1, condition2)) {
            warnings.push(`Conflicting conditions: ${condition1} and ${condition2}`)
          }
        }
      }
    }

    // Check for duplicate conditions
    const uniqueConditions = new Set(conditions)
    if (uniqueConditions.size !== conditions.length) {
      warnings.push('Duplicate conditions detected')
    }

    // Warn about excessive conditions
    if (conditions.length > 8) {
      warnings.push('Many conditions applied (>8), consider reviewing')
    }
  }

  /**
   * Validate size-specific rules
   */
  private validateSizeSpecificRules(token: Token, errors: string[], warnings: string[]): void {
    const sizeData = TOKEN_SIZE_GRID_MAP[token.size]
    if (!sizeData) return

    // Validate hit points for size
    if (token.hitPoints && this.config.enforceOfficialRules) {
      const expectedHPRange = this.getExpectedHPRange(token.size)
      if (token.hitPoints.maximum < expectedHPRange.min) {
        warnings.push(`Low hit points for ${token.size} creature (<${expectedHPRange.min})`)
      }
      if (token.hitPoints.maximum > expectedHPRange.max) {
        warnings.push(`High hit points for ${token.size} creature (>${expectedHPRange.max})`)
      }
    }

    // Validate speed for size
    if (token.speed && this.config.enforceOfficialRules) {
      const expectedSpeedRange = this.getExpectedSpeedRange(token.size)
      if (token.speed < expectedSpeedRange.min) {
        warnings.push(`Slow for ${token.size} creature (<${expectedSpeedRange.min} feet)`)
      }
      if (token.speed > expectedSpeedRange.max) {
        warnings.push(`Fast for ${token.size} creature (>${expectedSpeedRange.max} feet)`)
      }
    }
  }

  /**
   * Apply conditions to token with validation
   */
  applyConditions(
    currentConditions: readonly ConditionEffect[],
    newConditions: readonly string[],
    source?: string
  ): ConditionApplicationResult {
    const applied: ConditionType[] = []
    const blocked: ConditionType[] = []
    const replaced: ConditionType[] = []
    const warnings: string[] = []

    const resultConditions = [...currentConditions]

    for (const conditionName of newConditions) {
      if (!isValidCondition(conditionName)) {
        if (this.config.allowCustomConditions) {
          warnings.push(`Applied custom condition: ${conditionName}`)
          // Add custom condition (simplified)
          continue
        } else {
          warnings.push(`Blocked invalid condition: ${conditionName}`)
          continue
        }
      }

      const condition = conditionName as ConditionType
      const validation = CONDITION_VALIDATIONS[condition]

      // Check if condition already exists
      const existing = resultConditions.find(c => c.type === condition)
      if (existing && !validation.canStack) {
        warnings.push(`Condition ${condition} already applied`)
        continue
      }

      // Check for conflicts
      const conflicts = resultConditions.filter(c =>
        isValidCondition(c.type) && doConditionsConflict(condition, c.type)
      )

      if (conflicts.length > 0) {
        // Handle interactions
        for (const conflict of conflicts) {
          if (!isValidCondition(conflict.type)) continue

          const interaction = getConditionInteraction(condition, conflict.type)
          if (interaction) {
            switch (interaction.interaction) {
              case 'blocks':
                blocked.push(condition)
                warnings.push(`${condition} blocked by existing ${conflict.type}`)
                break

              case 'replaces':
                replaced.push(conflict.type)
                // Remove old condition and add new one
                const index = resultConditions.findIndex(c => c.type === conflict.type)
                if (index !== -1) {
                  resultConditions.splice(index, 1)
                }
                break

              case 'upgrades':
                replaced.push(conflict.type)
                // Remove lesser condition
                const upgradeIndex = resultConditions.findIndex(c => c.type === conflict.type)
                if (upgradeIndex !== -1) {
                  resultConditions.splice(upgradeIndex, 1)
                }
                break
            }
          }
        }

        if (blocked.includes(condition)) {
          continue
        }
      }

      // Add the condition
      const conditionEffect: ConditionEffect = {
        type: condition,
        source,
        duration: -1, // Indefinite by default
        appliedAt: new Date(),
        appliedBy: source
      }

      resultConditions.push(conditionEffect)
      applied.push(condition)
    }

    return {
      success: applied.length > 0,
      applied,
      blocked,
      replaced,
      warnings
    }
  }

  /**
   * Remove conditions from token
   */
  removeConditions(
    currentConditions: readonly ConditionEffect[],
    conditionsToRemove: readonly string[]
  ): ConditionRemovalResult {
    const removed: ConditionType[] = []
    const remaining: ConditionType[] = []
    const warnings: string[] = []

    const resultConditions = currentConditions.filter(condition => {
      const shouldRemove = conditionsToRemove.includes(condition.type)

      if (shouldRemove) {
        if (isValidCondition(condition.type)) {
          removed.push(condition.type)
        } else {
          warnings.push(`Removed custom condition: ${condition.type}`)
        }
        return false
      } else {
        if (isValidCondition(condition.type)) {
          remaining.push(condition.type)
        }
        return true
      }
    })

    // Check for conditions that weren't found
    for (const conditionName of conditionsToRemove) {
      if (!currentConditions.some(c => c.type === conditionName)) {
        warnings.push(`Condition not found: ${conditionName}`)
      }
    }

    return {
      success: removed.length > 0,
      removed,
      remaining,
      warnings
    }
  }

  /**
   * Get expected HP range for creature size
   */
  private getExpectedHPRange(size: TokenSize): { min: number; max: number } {
    const ranges: Record<TokenSize, { min: number; max: number }> = {
      tiny: { min: 1, max: 20 },
      small: { min: 3, max: 50 },
      medium: { min: 5, max: 100 },
      large: { min: 20, max: 200 },
      huge: { min: 50, max: 400 },
      gargantuan: { min: 100, max: 600 }
    }

    return ranges[size]
  }

  /**
   * Get expected speed range for creature size
   */
  private getExpectedSpeedRange(size: TokenSize): { min: number; max: number } {
    const ranges: Record<TokenSize, { min: number; max: number }> = {
      tiny: { min: 10, max: 40 },
      small: { min: 15, max: 40 },
      medium: { min: 20, max: 50 },
      large: { min: 25, max: 60 },
      huge: { min: 20, max: 80 },
      gargantuan: { min: 15, max: 100 }
    }

    return ranges[size]
  }

  /**
   * Check if string is valid hex color
   */
  private isValidHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color)
  }

  /**
   * Update validation configuration
   */
  updateConfig(updates: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * Get current configuration
   */
  getConfig(): ValidationConfig {
    return { ...this.config }
  }

  /**
   * Validate token name uniqueness
   */
  validateTokenNameUniqueness(
    name: string,
    existingTokens: readonly Token[],
    excludeTokenId?: string
  ): { isUnique: boolean; suggestions: string[] } {
    const trimmedName = name.trim().toLowerCase()

    if (!trimmedName) {
      return { isUnique: false, suggestions: ['Name cannot be empty'] }
    }

    const conflicts = existingTokens.filter(token =>
      token.name.toLowerCase() === trimmedName &&
      token.id !== excludeTokenId
    )

    if (conflicts.length === 0) {
      return { isUnique: true, suggestions: [] }
    }

    // Generate suggestions for unique names
    const suggestions = []
    for (let i = 2; i <= 10; i++) {
      const suggestion = `${name} ${i}`
      const suggestionExists = existingTokens.some(token =>
        token.name.toLowerCase() === suggestion.toLowerCase() &&
        token.id !== excludeTokenId
      )

      if (!suggestionExists) {
        suggestions.push(suggestion)
        if (suggestions.length >= 3) break
      }
    }

    return {
      isUnique: false,
      suggestions: suggestions.length > 0 ? suggestions : [`${name} (Copy)`]
    }
  }

  /**
   * Get validation summary for multiple tokens
   */
  getValidationSummary(tokens: readonly Token[]): {
    totalTokens: number
    validTokens: number
    tokensWithErrors: number
    tokensWithWarnings: number
    dndCompliantTokens: number
    commonIssues: string[]
  } {
    let validTokens = 0
    let tokensWithErrors = 0
    let tokensWithWarnings = 0
    let dndCompliantTokens = 0
    const allErrors: string[] = []
    const allWarnings: string[] = []

    for (const token of tokens) {
      const validation = this.validateToken(token)

      if (validation.isValid) {
        validTokens++
      }

      if (validation.errors.length > 0) {
        tokensWithErrors++
        allErrors.push(...validation.errors)
      }

      if (validation.warnings.length > 0) {
        tokensWithWarnings++
        allWarnings.push(...validation.warnings)
      }

      if (validation.dndCompliant) {
        dndCompliantTokens++
      }
    }

    // Find most common issues
    const errorCounts = new Map<string, number>()
    const warningCounts = new Map<string, number>()

    allErrors.forEach(error => {
      errorCounts.set(error, (errorCounts.get(error) ?? 0) + 1)
    })

    allWarnings.forEach(warning => {
      warningCounts.set(warning, (warningCounts.get(warning) ?? 0) + 1)
    })

    const commonErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([error, count]) => `${error} (${count} tokens)`)

    const commonWarnings = Array.from(warningCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([warning, count]) => `${warning} (${count} tokens)`)

    const commonIssues = [...commonErrors, ...commonWarnings]

    return {
      totalTokens: tokens.length,
      validTokens,
      tokensWithErrors,
      tokensWithWarnings,
      dndCompliantTokens,
      commonIssues
    }
  }
}