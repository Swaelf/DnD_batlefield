/**
 * Property Validation Service
 *
 * Handles validation of property values with D&D 5e rule compliance
 * following the established service patterns from previous modules.
 */

import type {
  PropertyField,
  PropertyValues,
  PropertyValidationResult,
  ValidationRule,
  DNDValidationRule,
  DNDToken,
  PropertyFieldType
} from '../types'
import { DND_CREATURE_SIZES, DND_CONDITIONS } from '../types'

/**
 * Service for validating property values with D&D 5e compliance
 */
export class PropertyValidationService {
  private dndValidationEnabled: boolean
  private enforceOfficialRules: boolean

  constructor(options: { enableDNDValidation?: boolean; enforceOfficialRules?: boolean } = {}) {
    this.dndValidationEnabled = options.enableDNDValidation ?? true
    this.enforceOfficialRules = options.enforceOfficialRules ?? false
  }

  /**
   * Validate a single property field value
   */
  validateField(field: PropertyField, value: unknown): PropertyValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let isValid = true
    let dndCompliant = true

    // Basic validation rules
    if (field.validation) {
      for (const rule of field.validation) {
        const ruleResult = this.validateRule(rule, value, field)
        if (!ruleResult.isValid) {
          errors.push(ruleResult.message)
          isValid = false
        }
      }
    }

    // Type-specific validation
    const typeValidation = this.validateFieldType(field.type, value, field)
    if (!typeValidation.isValid) {
      errors.push(...typeValidation.errors)
      warnings.push(...typeValidation.warnings)
      isValid = isValid && typeValidation.isValid
    }

    // D&D rule validation
    if (this.dndValidationEnabled && field.dndRule) {
      const dndValidation = this.validateDNDRule(field.dndRule, value, field)
      if (!dndValidation.isValid) {
        if (this.enforceOfficialRules) {
          errors.push(...dndValidation.errors)
          isValid = false
        } else {
          warnings.push(...dndValidation.warnings)
        }
        dndCompliant = false
      }
    }

    return {
      field: field.key,
      isValid,
      errors,
      warnings,
      dndCompliant
    }
  }

  /**
   * Validate all properties for an object
   */
  validateProperties(fields: readonly PropertyField[], values: PropertyValues): {
    readonly isValid: boolean
    readonly results: readonly PropertyValidationResult[]
    readonly errors: Record<string, string[]>
    readonly warnings: Record<string, string[]>
    readonly dndCompliant: boolean
  } {
    const results: PropertyValidationResult[] = []
    const errors: Record<string, string[]> = {}
    const warnings: Record<string, string[]> = {}
    let overallValid = true
    let overallDNDCompliant = true

    for (const field of fields) {
      const value = values.values[field.key]
      const result = this.validateField(field, value)

      results.push(result)

      if (!result.isValid) {
        overallValid = false
        errors[field.key] = [...result.errors]
      }

      if (result.warnings.length > 0) {
        warnings[field.key] = [...result.warnings]
      }

      if (!result.dndCompliant) {
        overallDNDCompliant = false
      }
    }

    return {
      isValid: overallValid,
      results,
      errors,
      warnings,
      dndCompliant: overallDNDCompliant
    }
  }

  /**
   * Validate a specific validation rule
   */
  private validateRule(rule: ValidationRule, value: unknown, _field: PropertyField): { isValid: boolean; message: string } {
    switch (rule.type) {
      case 'required':
        return {
          isValid: value !== null && value !== undefined && value !== '',
          message: rule.message
        }

      case 'min':
        if (typeof value === 'number' && typeof rule.value === 'number') {
          return {
            isValid: value >= rule.value,
            message: rule.message
          }
        }
        if (typeof value === 'string' && typeof rule.value === 'number') {
          return {
            isValid: value.length >= rule.value,
            message: rule.message
          }
        }
        return { isValid: true, message: '' }

      case 'max':
        if (typeof value === 'number' && typeof rule.value === 'number') {
          return {
            isValid: value <= rule.value,
            message: rule.message
          }
        }
        if (typeof value === 'string' && typeof rule.value === 'number') {
          return {
            isValid: value.length <= rule.value,
            message: rule.message
          }
        }
        return { isValid: true, message: '' }

      case 'pattern':
        if (typeof value === 'string' && rule.value instanceof RegExp) {
          return {
            isValid: rule.value.test(value),
            message: rule.message
          }
        }
        return { isValid: true, message: '' }

      case 'custom':
        if (rule.validator && typeof rule.validator === 'function') {
          return {
            isValid: rule.validator(value),
            message: rule.message
          }
        }
        return { isValid: true, message: '' }

      default:
        return { isValid: true, message: '' }
    }
  }

  /**
   * Validate based on field type
   */
  private validateFieldType(
    type: PropertyFieldType,
    value: unknown,
    _field: PropertyField
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    switch (type) {
      case 'number':
        if (value !== null && value !== undefined && isNaN(Number(value))) {
          errors.push('Value must be a valid number')
        }
        break

      case 'color':
        if (typeof value === 'string') {
          const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
          if (!colorRegex.test(value)) {
            errors.push('Value must be a valid hex color (e.g., #FF0000)')
          }
        }
        break

      case 'boolean':
        if (value !== null && value !== undefined && typeof value !== 'boolean') {
          errors.push('Value must be true or false')
        }
        break

      case 'dnd-size':
        if (typeof value === 'string') {
          if (!Object.keys(DND_CREATURE_SIZES).includes(value)) {
            errors.push('Value must be a valid D&D creature size')
          }
        }
        break

      case 'dnd-speed':
        if (typeof value === 'number') {
          if (value < 0) {
            errors.push('Speed cannot be negative')
          }
          if (value > 120 && this.enforceOfficialRules) {
            warnings.push('Speed above 120 feet is uncommon in D&D 5e')
          }
        }
        break

      case 'dnd-stat':
        if (typeof value === 'number') {
          if (value < 1) {
            errors.push('Ability scores must be at least 1')
          }
          if (value > 30 && this.enforceOfficialRules) {
            warnings.push('Ability scores above 30 are legendary in D&D 5e')
          }
        }
        break

      case 'dnd-ac':
        if (typeof value === 'number') {
          if (value < 1) {
            errors.push('Armor Class must be at least 1')
          }
          if (value > 25 && this.enforceOfficialRules) {
            warnings.push('Armor Class above 25 is extremely rare in D&D 5e')
          }
        }
        break

      case 'dnd-hp':
        if (typeof value === 'number') {
          if (value < 0) {
            errors.push('Hit Points cannot be negative')
          }
          if (value > 1000 && this.enforceOfficialRules) {
            warnings.push('Hit Points above 1000 are epic-level in D&D 5e')
          }
        }
        break

      case 'condition':
        if (typeof value === 'string') {
          if (!Object.keys(DND_CONDITIONS).includes(value)) {
            if (this.enforceOfficialRules) {
              errors.push('Condition must be an official D&D 5e condition')
            } else {
              warnings.push('This is a custom condition, not from D&D 5e')
            }
          }
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate D&D-specific rules
   */
  private validateDNDRule(
    rule: DNDValidationRule,
    value: unknown,
    _field: PropertyField
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    switch (rule.type) {
      case 'creature-size':
        if (typeof value === 'string') {
          const validSizes = Object.keys(DND_CREATURE_SIZES)
          if (!validSizes.includes(value)) {
            if (rule.enforceOfficial) {
              errors.push('Must be a valid D&D 5e creature size')
            } else {
              warnings.push('Custom creature size - not from D&D 5e')
            }
          }
        }
        break

      case 'movement-speed':
        if (typeof value === 'number') {
          const commonSpeeds = [10, 15, 20, 25, 30, 35, 40, 50, 60, 80, 120]
          if (!commonSpeeds.includes(value) && rule.enforceOfficial) {
            warnings.push('Uncommon movement speed for D&D 5e')
          }
        }
        break

      case 'ability-score':
        if (typeof value === 'number') {
          if ((value < 3 || value > 18) && rule.enforceOfficial) {
            warnings.push('Ability score outside typical D&D 5e range (3-18)')
          }
        }
        break

      case 'armor-class':
        if (typeof value === 'number') {
          if ((value < 8 || value > 22) && rule.enforceOfficial) {
            warnings.push('Armor Class outside typical D&D 5e range (8-22)')
          }
        }
        break

      case 'hit-points':
        if (typeof value === 'number') {
          if (value > 500 && rule.enforceOfficial) {
            warnings.push('Very high Hit Points for D&D 5e')
          }
        }
        break
    }

    if (rule.warningMessage && warnings.length > 0) {
      warnings.push(rule.warningMessage)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate token-specific D&D properties
   */
  validateDNDToken(token: DNDToken): PropertyValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate creature size consistency
    if (token.size) {
      const sizeData = DND_CREATURE_SIZES[token.size]
      if (!sizeData) {
        errors.push('Invalid creature size')
      }
    }

    // Validate stats if present
    if (token.stats) {
      const { abilities, armorClass, hitPoints } = token.stats

      // Validate ability scores
      Object.entries(abilities).forEach(([ability, score]) => {
        if (score < 1) {
          errors.push(`${ability} score must be at least 1`)
        }
        if (score > 30) {
          warnings.push(`${ability} score above 30 is legendary`)
        }
      })

      // Validate AC
      if (armorClass < 1) {
        errors.push('Armor Class must be at least 1')
      }
      if (armorClass > 25) {
        warnings.push('Armor Class above 25 is extremely rare')
      }

      // Validate HP
      if (hitPoints.current < 0) {
        errors.push('Current Hit Points cannot be negative')
      }
      if (hitPoints.maximum < 1) {
        errors.push('Maximum Hit Points must be at least 1')
      }
      if (hitPoints.current > hitPoints.maximum + hitPoints.temporary) {
        errors.push('Current HP cannot exceed maximum + temporary HP')
      }
    }

    // Validate conditions
    if (token.conditions) {
      token.conditions.forEach(condition => {
        // Handle both string and object conditions
        const conditionId = typeof condition === 'string' ? condition : (condition as any).id
        const conditionName = typeof condition === 'string' ? condition : (condition as any).name

        if (!DND_CONDITIONS[conditionId]) {
          if (this.enforceOfficialRules) {
            errors.push(`Unknown D&D condition: ${conditionName}`)
          } else {
            warnings.push(`Custom condition: ${conditionName}`)
          }
        }
      })
    }

    return {
      field: 'dnd-token',
      isValid: errors.length === 0,
      errors,
      warnings,
      dndCompliant: errors.length === 0 && warnings.length === 0
    }
  }

  /**
   * Get validation configuration
   */
  getConfig() {
    return {
      dndValidationEnabled: this.dndValidationEnabled,
      enforceOfficialRules: this.enforceOfficialRules
    }
  }

  /**
   * Update validation configuration
   */
  updateConfig(config: { enableDNDValidation?: boolean; enforceOfficialRules?: boolean }) {
    if (config.enableDNDValidation !== undefined) {
      this.dndValidationEnabled = config.enableDNDValidation
    }
    if (config.enforceOfficialRules !== undefined) {
      this.enforceOfficialRules = config.enforceOfficialRules
    }
  }
}