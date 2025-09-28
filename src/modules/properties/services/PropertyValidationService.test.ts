/**
 * Property Validation Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PropertyValidationService } from './PropertyValidationService'
import type {
  PropertyField,
  PropertyValues,
  DNDToken
} from '../types'
import {
  createPropertyFieldId,
  createValidationRuleId
} from '../types'

describe('PropertyValidationService', () => {
  let service: PropertyValidationService

  beforeEach(() => {
    service = new PropertyValidationService({
      enableDNDValidation: true,
      enforceOfficialRules: false
    })
  })

  describe('validateField', () => {
    it('validates required fields correctly', () => {
      const field: PropertyField = {
        id: createPropertyFieldId('test-field'),
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        validation: [{
          id: createValidationRuleId('required'),
          type: 'required',
          message: 'Name is required'
        }]
      }

      const emptyResult = service.validateField(field, '')
      const validResult = service.validateField(field, 'Test Name')

      expect(emptyResult.isValid).toBe(false)
      expect(emptyResult.errors).toContain('Name is required')

      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toEqual([])
    })

    it('validates number ranges correctly', () => {
      const field: PropertyField = {
        id: createPropertyFieldId('stat-field'),
        key: 'strength',
        label: 'Strength',
        type: 'dnd-stat',
        required: true,
        min: 1,
        max: 30,
        validation: [
          {
            id: createValidationRuleId('min'),
            type: 'min',
            value: 1,
            message: 'Strength must be at least 1'
          },
          {
            id: createValidationRuleId('max'),
            type: 'max',
            value: 30,
            message: 'Strength cannot exceed 30'
          }
        ]
      }

      const tooLowResult = service.validateField(field, 0)
      const tooHighResult = service.validateField(field, 31)
      const validResult = service.validateField(field, 15)

      expect(tooLowResult.isValid).toBe(false)
      expect(tooLowResult.errors).toContain('Strength must be at least 1')

      expect(tooHighResult.isValid).toBe(false)
      expect(tooHighResult.errors).toContain('Strength cannot exceed 30')

      expect(validResult.isValid).toBe(true)
    })

    it('validates D&D creature sizes', () => {
      const field: PropertyField = {
        id: createPropertyFieldId('size-field'),
        key: 'size',
        label: 'Size',
        type: 'dnd-size',
        required: true,
        dndRule: {
          type: 'creature-size',
          enforceOfficial: true,
          allowCustom: false
        }
      }

      const validResult = service.validateField(field, 'medium')
      const invalidResult = service.validateField(field, 'gigantic')

      expect(validResult.isValid).toBe(true)
      expect(validResult.dndCompliant).toBe(true)

      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.dndCompliant).toBe(false)
    })

    it('validates color hex format', () => {
      const field: PropertyField = {
        id: createPropertyFieldId('color-field'),
        key: 'color',
        label: 'Color',
        type: 'color',
        required: true
      }

      const validResult = service.validateField(field, '#FF0000')
      const invalidResult = service.validateField(field, 'red')

      expect(validResult.isValid).toBe(true)
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors).toContain('Value must be a valid hex color (e.g., #FF0000)')
    })
  })

  describe('validateProperties', () => {
    it('validates all fields and returns summary', () => {
      const fields: PropertyField[] = [
        {
          id: createPropertyFieldId('name-field'),
          key: 'name',
          label: 'Name',
          type: 'text',
          required: true,
          validation: [{
            id: createValidationRuleId('required'),
            type: 'required',
            message: 'Name is required'
          }]
        },
        {
          id: createPropertyFieldId('hp-field'),
          key: 'hitPoints',
          label: 'Hit Points',
          type: 'dnd-hp',
          required: false,
          min: 1,
          validation: [{
            id: createValidationRuleId('min-hp'),
            type: 'min',
            value: 1,
            message: 'Hit Points must be at least 1'
          }]
        }
      ]

      const values: PropertyValues = {
        objectId: 'test-object',
        objectType: 'token',
        values: {
          name: '', // Invalid - required but empty
          hitPoints: 0 // Invalid - below minimum
        },
        isValid: true,
        errors: {},
        warnings: {},
        lastModified: new Date()
      }

      const result = service.validateProperties(fields, values)

      expect(result.isValid).toBe(false)
      expect(result.results).toHaveLength(2)
      expect(result.errors).toHaveProperty('name')
      expect(result.errors).toHaveProperty('hitPoints')
    })

    it('passes validation with valid values', () => {
      const fields: PropertyField[] = [
        {
          id: createPropertyFieldId('name-field'),
          key: 'name',
          label: 'Name',
          type: 'text',
          required: true,
          validation: [{
            id: createValidationRuleId('required'),
            type: 'required',
            message: 'Name is required'
          }]
        }
      ]

      const values: PropertyValues = {
        objectId: 'test-object',
        objectType: 'token',
        values: {
          name: 'Valid Name'
        },
        isValid: true,
        errors: {},
        warnings: {},
        lastModified: new Date()
      }

      const result = service.validateProperties(fields, values)

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
      expect(result.warnings).toEqual({})
    })
  })

  describe('validateDNDToken', () => {
    it('validates D&D token with stats', () => {
      const token: DNDToken = {
        id: 'test-token',
        type: 'token',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#922610',
        opacity: 1,
        shape: 'circle',
        stats: {
          armorClass: 15,
          hitPoints: {
            current: 25,
            maximum: 30,
            temporary: 0
          },
          speed: {
            walk: 30
          },
          abilities: {
            strength: 14,
            dexterity: 16,
            constitution: 13,
            intelligence: 10,
            wisdom: 12,
            charisma: 8
          }
        }
      }

      const result = service.validateDNDToken(token)

      expect(result.isValid).toBe(true)
      expect(result.dndCompliant).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('validates D&D token with invalid stats', () => {
      const token: DNDToken = {
        id: 'test-token',
        type: 'token',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#922610',
        opacity: 1,
        shape: 'circle',
        stats: {
          armorClass: 0, // Invalid - too low
          hitPoints: {
            current: 35, // Invalid - exceeds maximum
            maximum: 30,
            temporary: 0
          },
          speed: {
            walk: 30
          },
          abilities: {
            strength: 0, // Invalid - too low
            dexterity: 16,
            constitution: 13,
            intelligence: 10,
            wisdom: 12,
            charisma: 8
          }
        }
      }

      const result = service.validateDNDToken(token)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors).toContain('Armor Class must be at least 1')
      expect(result.errors).toContain('strength score must be at least 1')
      expect(result.errors).toContain('Current HP cannot exceed maximum + temporary HP')
    })
  })

  describe('D&D validation rules', () => {
    beforeEach(() => {
      service = new PropertyValidationService({
        enableDNDValidation: true,
        enforceOfficialRules: true
      })
    })

    it('enforces official D&D ability score ranges', () => {
      const field: PropertyField = {
        id: createPropertyFieldId('str-field'),
        key: 'strength',
        label: 'Strength',
        type: 'dnd-stat',
        required: true,
        dndRule: {
          type: 'ability-score',
          enforceOfficial: true,
          allowCustom: false
        }
      }

      const lowResult = service.validateField(field, 2)
      const highResult = service.validateField(field, 25)
      const normalResult = service.validateField(field, 15)

      expect(lowResult.warnings.length).toBeGreaterThan(0)
      expect(highResult.warnings.length).toBeGreaterThan(0)
      expect(normalResult.warnings).toEqual([])
    })

    it('validates movement speeds against D&D standards', () => {
      const field: PropertyField = {
        id: createPropertyFieldId('speed-field'),
        key: 'speed',
        label: 'Speed',
        type: 'dnd-speed',
        required: true,
        dndRule: {
          type: 'movement-speed',
          enforceOfficial: true,
          allowCustom: false
        }
      }

      const standardResult = service.validateField(field, 30)
      const uncommonResult = service.validateField(field, 45)

      expect(standardResult.warnings).toEqual([])
      expect(uncommonResult.warnings.length).toBeGreaterThan(0)
    })
  })

  describe('configuration management', () => {
    it('updates validation configuration', () => {
      const initialConfig = service.getConfig()
      expect(initialConfig.dndValidationEnabled).toBe(true)

      service.updateConfig({ enableDNDValidation: false })
      const updatedConfig = service.getConfig()
      expect(updatedConfig.dndValidationEnabled).toBe(false)
    })

    it('changes enforcement behavior with configuration', () => {
      service.updateConfig({ enforceOfficialRules: true })

      const field: PropertyField = {
        id: createPropertyFieldId('ac-field'),
        key: 'armorClass',
        label: 'Armor Class',
        type: 'dnd-ac',
        required: true,
        dndRule: {
          type: 'armor-class',
          enforceOfficial: true,
          allowCustom: false
        }
      }

      const result = service.validateField(field, 30) // Very high AC
      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })
})