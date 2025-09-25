/**
 * PropertiesPanel Organism Component
 *
 * Complete properties editing interface replacing the existing Properties Panel.
 * Maintains API compatibility while using atomic design patterns.
 * Follows organism design patterns with 100-150 line constraint.
 */

import React from 'react'
import { Settings, X, RotateCcw, Save } from 'lucide-react'
import { styled } from '@/styles/theme.config'
import { usePropertyEditor, usePropertyGroups } from '../../../hooks'
import { PropertyGroup, PropertyValidation } from '../../molecules'
import type { PropertyField } from '../../../types'

interface PropertiesPanelProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

const PanelContainer = styled('div', {
  width: '320px',
  height: '100%',
  background: 'white',
  borderLeft: '1px solid $gray300',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',

  variants: {
    open: {
      true: { transform: 'translateX(0)' },
      false: { transform: 'translateX(100%)' }
    }
  }
})

const PanelHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$3',
  borderBottom: '1px solid $gray300',
  background: '$gray50'
})

const PanelTitle = styled('h3', {
  margin: 0,
  fontSize: '$md',
  fontWeight: 600,
  color: '$gray900'
})

const PanelActions = styled('div', {
  display: 'flex',
  gap: '$1'
})

const ActionButton = styled('button', {
  padding: '$1',
  background: 'none',
  border: 'none',
  borderRadius: '$1',
  cursor: 'pointer',
  color: '$gray600',
  display: 'flex',
  alignItems: 'center',

  '&:hover': {
    background: '$gray200',
    color: '$gray800'
  }
})

const PanelContent = styled('div', {
  flex: 1,
  overflow: 'auto',
  padding: '$3'
})

const NoSelectionMessage = styled('div', {
  padding: '$4',
  textAlign: 'center',
  color: '$gray600',
  fontSize: '$sm'
})

const MultiSelectionInfo = styled('div', {
  padding: '$2',
  background: '$blue50',
  border: '1px solid $blue200',
  borderRadius: '$2',
  marginBottom: '$3',
  fontSize: '$sm',
  color: '$blue800'
})

const ObjectTypeHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2',
  background: '$dndRed',
  color: 'white',
  borderRadius: '$2',
  marginBottom: '$3',
  fontSize: '$sm',
  fontWeight: 600
})

const PanelFooter = styled('div', {
  padding: '$3',
  borderTop: '1px solid $gray300',
  background: '$gray50',
  display: 'flex',
  gap: '$2'
})

const FooterButton = styled('button', {
  flex: 1,
  padding: '$2',
  borderRadius: '$2',
  border: 'none',
  cursor: 'pointer',
  fontSize: '$sm',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$1',

  variants: {
    variant: {
      primary: {
        background: '$dndRed',
        color: 'white',
        '&:hover': { background: '$red700' }
      },
      secondary: {
        background: '$gray200',
        color: '$gray800',
        '&:hover': { background: '$gray300' }
      }
    }
  }
})

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
    <PanelContainer open={isOpen} className={className}>
      <PanelHeader>
        <PanelTitle>Properties</PanelTitle>
        <PanelActions>
          <ActionButton onClick={() => updateConfig({ showHelpText: !ui.isPanelCollapsed('help') })}>
            <Settings size={16} />
          </ActionButton>
          {onClose && (
            <ActionButton onClick={handleClose}>
              <X size={16} />
            </ActionButton>
          )}
        </PanelActions>
      </PanelHeader>

      <PanelContent>
        {!selectionState.hasSelection ? (
          <NoSelectionMessage>
            Select an object to edit its properties
          </NoSelectionMessage>
        ) : (
          <>
            {selectionState.isMultiSelection && (
              <MultiSelectionInfo>
                Editing {selectionState.selectedCount} objects.
                Common properties will affect all selected objects.
              </MultiSelectionInfo>
            )}

            {primaryObjectProperties && (
              <>
                <ObjectTypeHeader>
                  {primaryObjectProperties.objectType.toUpperCase()} PROPERTIES
                </ObjectTypeHeader>

                <PropertyValidation
                  objectId={primaryObjectProperties.objectId}
                  showDetailedErrors={false}
                />

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
      </PanelContent>

      {selectionState.hasSelection && (
        <PanelFooter>
          <FooterButton
            variant="secondary"
            onClick={handleReset}
            disabled={!editingState.isDirty}
          >
            <RotateCcw size={14} />
            Reset
          </FooterButton>
          <FooterButton
            variant="primary"
            onClick={handleSave}
            disabled={!editingState.isDirty}
          >
            <Save size={14} />
            Save
          </FooterButton>
        </PanelFooter>
      )}
    </PanelContainer>
  )
}