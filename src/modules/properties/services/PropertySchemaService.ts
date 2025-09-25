/**
 * Property Schema Service
 *
 * Manages property field definitions and schemas for different object types
 * with comprehensive D&D 5e integration and validation rules.
 */

import { nanoid } from 'nanoid'
import type {
  PropertySchema,
  PropertyField,
  PropertyGroup,
  ValidationRule,
  DNDValidationRule,
  MapObject,
  createPropertyFieldId,
  createPropertyGroupId,
  createValidationRuleId
} from '../types'

/**
 * Service for managing property schemas and field definitions
 */
export class PropertySchemaService {
  private schemas: Map<string, PropertySchema>
  private customFields: Map<string, PropertyField>

  constructor() {
    this.schemas = new Map()
    this.customFields = new Map()
    this.initializeBuiltInSchemas()
  }

  /**
   * Get property schema for an object type
   */
  getSchema(objectType: MapObject['type']): PropertySchema | null {
    return this.schemas.get(objectType) || null
  }

  /**
   * Get all available schemas
   */
  getAllSchemas(): PropertySchema[] {
    return Array.from(this.schemas.values())
  }

  /**
   * Get fields for an object type
   */
  getFields(objectType: MapObject['type']): readonly PropertyField[] {
    const schema = this.getSchema(objectType)
    return schema ? schema.fields : []
  }

  /**
   * Get groups for an object type
   */
  getGroups(objectType: MapObject['type']): readonly PropertyGroup[] {
    const schema = this.getSchema(objectType)
    return schema ? schema.groups : []
  }

  /**
   * Add custom field to schema
   */
  addCustomField(objectType: MapObject['type'], field: Omit<PropertyField, 'id'>): PropertyField {
    const fieldWithId: PropertyField = {
      ...field,
      id: createPropertyFieldId(nanoid())
    }

    this.customFields.set(fieldWithId.id, fieldWithId)

    // Update schema to include custom field
    const schema = this.getSchema(objectType)
    if (schema) {
      const updatedSchema: PropertySchema = {
        ...schema,
        fields: [...schema.fields, fieldWithId]
      }
      this.schemas.set(objectType, updatedSchema)
    }

    return fieldWithId
  }

  /**
   * Remove custom field
   */
  removeCustomField(fieldId: string): boolean {
    const field = this.customFields.get(fieldId)
    if (!field) return false

    this.customFields.delete(fieldId)

    // Update all schemas to remove this field
    for (const [objectType, schema] of this.schemas.entries()) {
      const updatedFields = schema.fields.filter(f => f.id !== fieldId)
      if (updatedFields.length !== schema.fields.length) {
        const updatedSchema: PropertySchema = {
          ...schema,
          fields: updatedFields
        }
        this.schemas.set(objectType, updatedSchema)
      }
    }

    return true
  }

  /**
   * Create validation rule
   */
  createValidationRule(rule: Omit<ValidationRule, 'id'>): ValidationRule {
    return {
      ...rule,
      id: createValidationRuleId(nanoid())
    }
  }

  /**
   * Create D&D validation rule
   */
  createDNDRule(type: DNDValidationRule['type'], options: Partial<DNDValidationRule> = {}): DNDValidationRule {
    return {
      type,
      enforceOfficial: false,
      allowCustom: true,
      ...options
    }
  }

  /**
   * Initialize built-in schemas for all object types
   */
  private initializeBuiltInSchemas(): void {
    // Token schema
    this.schemas.set('token', this.createTokenSchema())

    // Shape schema
    this.schemas.set('shape', this.createShapeSchema())

    // Text schema
    this.schemas.set('text', this.createTextSchema())

    // Spell schema
    this.schemas.set('spell', this.createSpellSchema())
  }

  /**
   * Create comprehensive token property schema
   */
  private createTokenSchema(): PropertySchema {
    const groups: PropertyGroup[] = [
      {
        id: createPropertyGroupId('token-basic'),
        name: 'Basic Properties',
        description: 'Essential token properties',
        icon: 'user',
        collapsible: false,
        defaultExpanded: true,
        order: 1
      },
      {
        id: createPropertyGroupId('token-appearance'),
        name: 'Appearance',
        description: 'Visual styling and display options',
        icon: 'palette',
        collapsible: true,
        defaultExpanded: true,
        order: 2
      },
      {
        id: createPropertyGroupId('token-dnd'),
        name: 'D&D Properties',
        description: 'D&D 5e creature stats and properties',
        icon: 'shield',
        collapsible: true,
        defaultExpanded: false,
        order: 3
      },
      {
        id: createPropertyGroupId('token-combat'),
        name: 'Combat',
        description: 'Initiative, conditions, and combat state',
        icon: 'sword',
        collapsible: true,
        defaultExpanded: false,
        order: 4
      }
    ]

    const fields: PropertyField[] = [
      // Basic Properties
      {
        id: createPropertyFieldId('token-name'),
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Token name',
        helpText: 'Display name for this token',
        groupId: createPropertyGroupId('token-basic'),
        validation: [
          this.createValidationRule({
            type: 'required',
            message: 'Name is required'
          }),
          this.createValidationRule({
            type: 'max',
            value: 50,
            message: 'Name cannot exceed 50 characters'
          })
        ]
      },
      {
        id: createPropertyFieldId('token-size'),
        key: 'size',
        label: 'Size',
        type: 'dnd-size',
        required: true,
        helpText: 'D&D 5e creature size category',
        groupId: createPropertyGroupId('token-basic'),
        options: Object.entries(this.getDNDSizeOptions()).map(([value, data]) => ({
          value,
          label: `${data.label} (${data.gridSquares} squares)`,
          description: data.examples.join(', ')
        })),
        dndRule: this.createDNDRule('creature-size', { enforceOfficial: true })
      },
      {
        id: createPropertyFieldId('token-position-x'),
        key: 'position.x',
        label: 'X Position',
        type: 'number',
        required: true,
        helpText: 'Horizontal position on the map',
        groupId: createPropertyGroupId('token-basic')
      },
      {
        id: createPropertyFieldId('token-position-y'),
        key: 'position.y',
        label: 'Y Position',
        type: 'number',
        required: true,
        helpText: 'Vertical position on the map',
        groupId: createPropertyGroupId('token-basic')
      },

      // Appearance
      {
        id: createPropertyFieldId('token-color'),
        key: 'color',
        label: 'Color',
        type: 'color',
        required: true,
        defaultValue: '#922610',
        helpText: 'Primary token color',
        groupId: createPropertyGroupId('token-appearance')
      },
      {
        id: createPropertyFieldId('token-shape'),
        key: 'shape',
        label: 'Shape',
        type: 'select',
        required: true,
        defaultValue: 'circle',
        helpText: 'Token shape style',
        groupId: createPropertyGroupId('token-appearance'),
        options: [
          { value: 'circle', label: 'Circle', description: 'Round token' },
          { value: 'square', label: 'Square', description: 'Square token' }
        ]
      },
      {
        id: createPropertyFieldId('token-opacity'),
        key: 'opacity',
        label: 'Opacity',
        type: 'range',
        required: true,
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.1,
        helpText: 'Token transparency (0 = invisible, 1 = opaque)',
        groupId: createPropertyGroupId('token-appearance')
      },
      {
        id: createPropertyFieldId('token-show-label'),
        key: 'showLabel',
        label: 'Show Label',
        type: 'boolean',
        required: false,
        defaultValue: true,
        helpText: 'Display token name as label',
        groupId: createPropertyGroupId('token-appearance')
      },

      // D&D Properties
      {
        id: createPropertyFieldId('token-ac'),
        key: 'stats.armorClass',
        label: 'Armor Class',
        type: 'dnd-ac',
        required: false,
        min: 1,
        max: 30,
        helpText: 'D&D 5e Armor Class',
        groupId: createPropertyGroupId('token-dnd'),
        dndRule: this.createDNDRule('armor-class')
      },
      {
        id: createPropertyFieldId('token-hp-max'),
        key: 'stats.hitPoints.maximum',
        label: 'Max Hit Points',
        type: 'dnd-hp',
        required: false,
        min: 1,
        helpText: 'Maximum Hit Points',
        groupId: createPropertyGroupId('token-dnd'),
        dndRule: this.createDNDRule('hit-points')
      },
      {
        id: createPropertyFieldId('token-hp-current'),
        key: 'stats.hitPoints.current',
        label: 'Current Hit Points',
        type: 'dnd-hp',
        required: false,
        min: 0,
        helpText: 'Current Hit Points',
        groupId: createPropertyGroupId('token-dnd')
      },
      {
        id: createPropertyFieldId('token-speed'),
        key: 'stats.speed.walk',
        label: 'Walking Speed',
        type: 'dnd-speed',
        required: false,
        min: 0,
        helpText: 'Walking speed in feet',
        groupId: createPropertyGroupId('token-dnd'),
        dndRule: this.createDNDRule('movement-speed')
      },

      // Combat
      {
        id: createPropertyFieldId('token-initiative'),
        key: 'initiative',
        label: 'Initiative',
        type: 'number',
        required: false,
        helpText: 'Initiative modifier or rolled value',
        groupId: createPropertyGroupId('token-combat')
      },
      {
        id: createPropertyFieldId('token-conditions'),
        key: 'conditions',
        label: 'Conditions',
        type: 'multiselect',
        required: false,
        helpText: 'Active D&D conditions',
        groupId: createPropertyGroupId('token-combat'),
        options: Object.entries(this.getDNDConditionOptions()).map(([value, condition]) => ({
          value,
          label: condition.name,
          description: condition.description,
          icon: condition.icon
        }))
      }
    ]

    return {
      objectType: 'token',
      groups,
      fields,
      validation: [],
      dndCompliant: true
    }
  }

  /**
   * Create shape property schema
   */
  private createShapeSchema(): PropertySchema {
    const groups: PropertyGroup[] = [
      {
        id: createPropertyGroupId('shape-basic'),
        name: 'Basic Properties',
        icon: 'square',
        collapsible: false,
        defaultExpanded: true,
        order: 1
      },
      {
        id: createPropertyGroupId('shape-style'),
        name: 'Styling',
        icon: 'palette',
        collapsible: true,
        defaultExpanded: true,
        order: 2
      }
    ]

    const fields: PropertyField[] = [
      {
        id: createPropertyFieldId('shape-type'),
        key: 'shapeType',
        label: 'Shape Type',
        type: 'select',
        required: true,
        groupId: createPropertyGroupId('shape-basic'),
        options: [
          { value: 'rectangle', label: 'Rectangle' },
          { value: 'circle', label: 'Circle' },
          { value: 'polygon', label: 'Polygon' },
          { value: 'line', label: 'Line' }
        ]
      },
      {
        id: createPropertyFieldId('shape-fill'),
        key: 'fillColor',
        label: 'Fill Color',
        type: 'color',
        required: true,
        defaultValue: '#C9AD6A',
        groupId: createPropertyGroupId('shape-style')
      },
      {
        id: createPropertyFieldId('shape-stroke'),
        key: 'strokeColor',
        label: 'Border Color',
        type: 'color',
        required: true,
        defaultValue: '#922610',
        groupId: createPropertyGroupId('shape-style')
      },
      {
        id: createPropertyFieldId('shape-stroke-width'),
        key: 'strokeWidth',
        label: 'Border Width',
        type: 'number',
        required: true,
        min: 0,
        max: 20,
        defaultValue: 2,
        groupId: createPropertyGroupId('shape-style')
      }
    ]

    return {
      objectType: 'shape',
      groups,
      fields,
      validation: [],
      dndCompliant: false
    }
  }

  /**
   * Create text property schema
   */
  private createTextSchema(): PropertySchema {
    const groups: PropertyGroup[] = [
      {
        id: createPropertyGroupId('text-content'),
        name: 'Content',
        icon: 'type',
        collapsible: false,
        defaultExpanded: true,
        order: 1
      },
      {
        id: createPropertyGroupId('text-style'),
        name: 'Typography',
        icon: 'font',
        collapsible: true,
        defaultExpanded: true,
        order: 2
      }
    ]

    const fields: PropertyField[] = [
      {
        id: createPropertyFieldId('text-content'),
        key: 'text',
        label: 'Text Content',
        type: 'text',
        required: true,
        helpText: 'Text to display',
        groupId: createPropertyGroupId('text-content')
      },
      {
        id: createPropertyFieldId('text-font-size'),
        key: 'fontSize',
        label: 'Font Size',
        type: 'number',
        required: true,
        min: 8,
        max: 144,
        defaultValue: 16,
        helpText: 'Font size in pixels',
        groupId: createPropertyGroupId('text-style')
      },
      {
        id: createPropertyFieldId('text-color'),
        key: 'color',
        label: 'Text Color',
        type: 'color',
        required: true,
        defaultValue: '#000000',
        groupId: createPropertyGroupId('text-style')
      }
    ]

    return {
      objectType: 'text',
      groups,
      fields,
      validation: [],
      dndCompliant: false
    }
  }

  /**
   * Create spell property schema
   */
  private createSpellSchema(): PropertySchema {
    const groups: PropertyGroup[] = [
      {
        id: createPropertyGroupId('spell-effect'),
        name: 'Spell Effect',
        icon: 'zap',
        collapsible: false,
        defaultExpanded: true,
        order: 1
      },
      {
        id: createPropertyGroupId('spell-appearance'),
        name: 'Appearance',
        icon: 'eye',
        collapsible: true,
        defaultExpanded: true,
        order: 2
      }
    ]

    const fields: PropertyField[] = [
      {
        id: createPropertyFieldId('spell-name'),
        key: 'name',
        label: 'Spell Name',
        type: 'text',
        required: true,
        groupId: createPropertyGroupId('spell-effect')
      },
      {
        id: createPropertyFieldId('spell-duration'),
        key: 'duration',
        label: 'Duration (Rounds)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 0,
        helpText: '0 = instant, >0 = persistent rounds',
        groupId: createPropertyGroupId('spell-effect')
      },
      {
        id: createPropertyFieldId('spell-color'),
        key: 'color',
        label: 'Effect Color',
        type: 'color',
        required: true,
        defaultValue: '#ff4500',
        groupId: createPropertyGroupId('spell-appearance')
      }
    ]

    return {
      objectType: 'spell',
      groups,
      fields,
      validation: [],
      dndCompliant: true
    }
  }

  /**
   * Get D&D size options with metadata
   */
  private getDNDSizeOptions() {
    return {
      tiny: { label: 'Tiny', gridSquares: 0.5, examples: ['Imp', 'Sprite'] },
      small: { label: 'Small', gridSquares: 1, examples: ['Goblin', 'Halfling'] },
      medium: { label: 'Medium', gridSquares: 1, examples: ['Human', 'Elf'] },
      large: { label: 'Large', gridSquares: 2, examples: ['Ogre', 'Horse'] },
      huge: { label: 'Huge', gridSquares: 3, examples: ['Giant', 'Dragon'] },
      gargantuan: { label: 'Gargantuan', gridSquares: 4, examples: ['Ancient Dragon'] }
    }
  }

  /**
   * Get D&D condition options
   */
  private getDNDConditionOptions() {
    return {
      blinded: { name: 'Blinded', description: 'Cannot see', icon: 'eye-off' },
      charmed: { name: 'Charmed', description: 'Charmed by another creature', icon: 'heart' },
      deafened: { name: 'Deafened', description: 'Cannot hear', icon: 'volume-x' },
      frightened: { name: 'Frightened', description: 'Frightened of source', icon: 'alert-triangle' },
      grappled: { name: 'Grappled', description: 'Speed becomes 0', icon: 'link' },
      incapacitated: { name: 'Incapacitated', description: 'Cannot take actions', icon: 'pause' },
      invisible: { name: 'Invisible', description: 'Cannot be seen', icon: 'ghost' },
      paralyzed: { name: 'Paralyzed', description: 'Cannot move or act', icon: 'pause-circle' },
      poisoned: { name: 'Poisoned', description: 'Disadvantage on attacks', icon: 'droplet' },
      prone: { name: 'Prone', description: 'Lying down', icon: 'trending-down' },
      restrained: { name: 'Restrained', description: 'Speed 0, disadvantage', icon: 'lock' },
      stunned: { name: 'Stunned', description: 'Incapacitated, fails saves', icon: 'zap-off' },
      unconscious: { name: 'Unconscious', description: 'Incapacitated and prone', icon: 'moon' }
    }
  }
}