/**
 * Properties Module - Main Export
 *
 * Complete Properties module following atomic design architecture
 * established in Timeline (Phase 3), Actions (Phase 4), and Spells (Phase 5) modules.
 */

// Export types with specific naming to avoid conflicts
export type {
  PropertyId,
  PropertyGroupId,
  PropertyFieldId,
  PropertyFieldType,
  PropertyField,
  PropertyGroup,
  PropertyChange,
  PropertyValidationResult,
  Position
} from './types'

// Export services
export * from './services'

// Export store
export * from './store'

// Export hooks
export * from './hooks'

// Export components
export * from './components'

// Main component for easy import
export { PropertiesPanel } from './components/organisms/PropertiesPanel'