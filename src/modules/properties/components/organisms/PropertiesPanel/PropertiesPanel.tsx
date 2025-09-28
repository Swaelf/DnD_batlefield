/**
 * PropertiesPanel Organism Component
 * Complete properties editing interface replacing the existing Properties Panel
 */

import React from 'react'
import { Settings, X, RotateCcw, Save } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { usePropertyEditor, usePropertyGroups } from '../../../hooks'
import { PropertyGroup, PropertyValidation } from '../../molecules'
import type { PropertyField } from '../../../types'

interface PropertiesPanelProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
}


export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  isOpen = true,
  onClose,
  className
}) => {
  const {
    selectionState,
    editingState,
    primaryObjectProperties,
    ui,
    commitChanges,
    discardChanges,
    updateConfig
  } = usePropertyEditor()

  const groups = usePropertyGroups(
    primaryObjectProperties?.objectType || 'token'
  )

  const handleSave = () => {
    if (editingState.isDirty) {
      commitChanges('Save property changes')
    }
  }

  const handleReset = () => {
    if (selectionState.selectedObjectIds.length > 0) {
      discardChanges()
    }
  }

  const handleClose = () => {
    onClose?.()
  }

  if (!isOpen) return null

  return (
    <Box
      className={className}
      style={{
        width: '320px',
        height: '100%',
        backgroundColor: 'white',
        borderLeft: '1px solid var(--colors-gray300)',
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
      }}
    >
      {/* Panel Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          borderBottom: '1px solid var(--colors-gray300)',
          backgroundColor: 'var(--colors-gray50)'
        }}
      >
        <Text
          variant="heading"
          size="md"
          style={{
            margin: 0,
            fontWeight: '600',
            color: 'var(--colors-gray900)'
          }}
        >
          Properties
        </Text>
        <Box style={{ display: 'flex', gap: '4px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateConfig({ showHelpText: !ui.isPanelCollapsed('help') })}
            style={{
              padding: '4px',
              backgroundColor: 'none',
              color: 'var(--colors-gray600)'
            }}
          >
            <Settings size={16} />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              style={{
                padding: '4px',
                backgroundColor: 'none',
                color: 'var(--colors-gray600)'
              }}
            >
              <X size={16} />
            </Button>
          )}
        </Box>
      </Box>

      {/* Panel Content */}
      <Box
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px'
        }}
      >
        {!selectionState.hasSelection ? (
          <Box
            style={{
              padding: '16px',
              textAlign: 'center',
              color: 'var(--colors-gray600)',
              fontSize: '14px'
            }}
          >
            <Text variant="body" size="sm" style={{ color: 'var(--colors-gray600)' }}>
              Select an object to edit its properties
            </Text>
          </Box>
        ) : (
          <>
            {/* Multi-Selection Info */}
            {selectionState.isMultiSelection && (
              <Box
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--colors-blue50)',
                  border: '1px solid var(--colors-blue200)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: 'var(--colors-blue800)'
                }}
              >
                <Text variant="body" size="sm" style={{ color: 'var(--colors-blue800)' }}>
                  Editing {selectionState.selectedCount} objects.
                  Common properties will affect all selected objects.
                </Text>
              </Box>
            )}

            {/* Object Properties */}
            {primaryObjectProperties && (
              <>
                {/* Object Type Header */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: 'var(--colors-dndRed)',
                    color: 'white',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <Text
                    variant="body"
                    size="sm"
                    style={{
                      color: 'white',
                      fontWeight: '600'
                    }}
                  >
                    {primaryObjectProperties.objectType.toUpperCase()} PROPERTIES
                  </Text>
                </Box>

                {/* Property Validation */}
                <PropertyValidation
                  objectId={primaryObjectProperties.objectId}
                  showDetailedErrors={false}
                />

                {/* Property Groups */}
                {groups.groups
                  .sort((a, b) => a.order - b.order)
                  .map(group => (
                    <PropertyGroup
                      key={group.id}
                      group={group}
                      fields={primaryObjectProperties.fields as PropertyField[]}
                      objectId={primaryObjectProperties.objectId}
                      isExpanded={group.isExpanded}
                      onToggleExpanded={() => groups.toggleGroupExpanded(group.id)}
                    />
                  ))}
              </>
            )}
          </>
        )}
      </Box>

      {/* Panel Footer */}
      {selectionState.hasSelection && (
        <Box
          style={{
            padding: '12px',
            borderTop: '1px solid var(--colors-gray300)',
            backgroundColor: 'var(--colors-gray50)',
            display: 'flex',
            gap: '8px'
          }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!editingState.isDirty}
            style={{
              flex: 1,
              backgroundColor: 'var(--colors-gray200)',
              color: 'var(--colors-gray800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={14} />
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!editingState.isDirty}
            style={{
              flex: 1,
              backgroundColor: 'var(--colors-dndRed)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Save size={14} />
            Save
          </Button>
        </Box>
      )}
    </Box>
  )
}