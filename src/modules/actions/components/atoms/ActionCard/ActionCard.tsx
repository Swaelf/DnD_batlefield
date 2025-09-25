/**
 * Action Card Component
 * Displays an action with type, description, and controls
 */

import React from 'react'
import { styled } from '@/foundation/theme'
import type { UnifiedAction } from '../../types'

export type ActionCardProps = {
  action: UnifiedAction
  isSelected?: boolean
  showEditButton?: boolean
  onSelect?: (action: UnifiedAction) => void
  onEdit?: (action: UnifiedAction) => void
  className?: string
}

const Card = styled('div', {
  position: 'relative',
  padding: '$3',
  borderRadius: '$md',
  border: '1px solid $gray600',
  background: '$gray800',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    borderColor: '$gray500',
    background: '$gray750',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
  },

  variants: {
    selected: {
      true: {
        borderColor: '$dndRed',
        background: '$gray750',
        boxShadow: '0 0 0 1px $dndRed'
      }
    }
  }
})

const Header = styled('div', {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '$2',
  marginBottom: '$2'
})

const ActionName = styled('div', {
  fontSize: '$2',
  fontWeight: 600,
  color: '$gray100',
  lineHeight: 1.3
})

const ActionType = styled('span', {
  fontSize: '$1',
  fontWeight: 500,
  padding: '$1 $2',
  borderRadius: '$sm',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',

  variants: {
    type: {
      spell: {
        background: '$purple900',
        color: '$purple200'
      },
      attack: {
        background: '$red900',
        color: '$red200'
      },
      movement: {
        background: '$blue900',
        color: '$blue200'
      },
      interaction: {
        background: '$green900',
        color: '$green200'
      },
      environmental: {
        background: '$yellow900',
        color: '$yellow200'
      },
      sequence: {
        background: '$gray700',
        color: '$gray200'
      },
      utility: {
        background: '$orange900',
        color: '$orange200'
      }
    }
  }
})

const Description = styled('div', {
  fontSize: '$1',
  color: '$gray400',
  lineHeight: 1.4,
  marginBottom: '$2'
})

const Footer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$2'
})

const Tags = styled('div', {
  display: 'flex',
  gap: '$1',
  flexWrap: 'wrap'
})

const Tag = styled('span', {
  fontSize: '$1',
  padding: '2px $1',
  borderRadius: '$sm',
  background: '$gray700',
  color: '$gray300'
})

const Actions = styled('div', {
  display: 'flex',
  gap: '$1',
  opacity: 0,
  transition: 'opacity 0.2s ease',

  [`${Card}:hover &`]: {
    opacity: 1
  }
})

const ActionButton = styled('button', {
  width: 24,
  height: 24,
  borderRadius: '$sm',
  border: 'none',
  background: '$gray700',
  color: '$gray300',
  cursor: 'pointer',
  fontSize: '$1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: '$blue700',
    color: 'white'
  }
})

const CustomBadge = styled('div', {
  position: 'absolute',
  top: 4,
  right: 4,
  width: 8,
  height: 8,
  borderRadius: '$round',
  background: '$purple500',
  opacity: 0.8
})

const LevelBadge = styled('div', {
  fontSize: '$1',
  fontWeight: 600,
  color: '$yellow400',
  background: '$yellow900',
  padding: '2px $1',
  borderRadius: '$sm',
  minWidth: 20,
  textAlign: 'center'
})

/**
 * Action card component
 */
export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  isSelected = false,
  showEditButton = false,
  onSelect,
  onEdit,
  className
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSelect) {
      onSelect(action)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(action)
    }
  }

  // Get level for spells
  const level = action.type === 'spell' && (action.data as any).level

  // Limit tags to first 3
  const displayTags = action.tags.slice(0, 3)

  return (
    <Card
      selected={isSelected}
      onClick={handleClick}
      className={className}
    >
      {action.isCustom && <CustomBadge />}

      <Header>
        <ActionName title={action.name}>
          {action.name}
        </ActionName>
        <ActionType type={action.type}>
          {action.type}
        </ActionType>
      </Header>

      <Description title={action.description}>
        {action.description.length > 100
          ? `${action.description.slice(0, 97)}...`
          : action.description
        }
      </Description>

      <Footer>
        <Tags>
          {level !== undefined && (
            <LevelBadge title="Spell Level">
              {level}
            </LevelBadge>
          )}
          {displayTags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          {action.tags.length > 3 && (
            <Tag title={action.tags.slice(3).join(', ')}>
              +{action.tags.length - 3}
            </Tag>
          )}
        </Tags>

        <Actions>
          {showEditButton && action.customizable && (
            <ActionButton
              onClick={handleEdit}
              title="Edit action"
            >
              ✏
            </ActionButton>
          )}
        </Actions>
      </Footer>
    </Card>
  )
}