/**
 * ActionCard Atom Component
 * Rich action display with type badges, level indicators, and interaction controls
 */

import React from 'react'
import { Edit2 } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import type { UnifiedAction } from '@/types/unifiedAction'

export type ActionCardProps = {
  action: UnifiedAction
  isSelected?: boolean
  showEditButton?: boolean
  onSelect?: (action: UnifiedAction) => void
  onEdit?: (action: UnifiedAction) => void
  className?: string
}



export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  isSelected = false,
  showEditButton = false,
  onSelect,
  onEdit,
  className
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onSelect?.(action)
  }

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onEdit?.(action)
  }

  // Get level for spells
  const level = action.type === 'spell' && action.spellLevel

  // Limit tags to first 3
  const displayTags = action.tags.slice(0, 3)
  const remainingTagsCount = action.tags.length - 3

  // Get action type badge styling
  const getActionTypeStyle = (type: string) => {
    const styles = {
      spell: { backgroundColor: 'var(--colors-purple900)', color: 'var(--colors-purple200)' },
      attack: { backgroundColor: 'var(--colors-red900)', color: 'var(--colors-red200)' },
      movement: { backgroundColor: 'var(--colors-blue900)', color: 'var(--colors-blue200)' },
      interaction: { backgroundColor: 'var(--colors-green900)', color: 'var(--colors-green200)' },
      environmental: { backgroundColor: 'var(--colors-yellow900)', color: 'var(--colors-yellow200)' },
      sequence: { backgroundColor: 'var(--colors-gray700)', color: 'var(--colors-gray200)' },
      utility: { backgroundColor: 'var(--colors-orange900)', color: 'var(--colors-orange200)' }
    }
    return styles[type as keyof typeof styles] || styles.utility
  }

  const actionTypeStyle = getActionTypeStyle(action.type)

  // Truncate description if too long
  const description = action.description && action.description.length > 100
    ? `${action.description.substring(0, 97)}...`
    : action.description

  return (
    <Box
      className={className}
      onClick={handleClick}
      style={{
        position: 'relative',
        padding: '12px',
        borderRadius: '12px',
        border: `2px solid ${isSelected ? 'var(--colors-dndRed)' : 'var(--colors-gray600)'}`,
        backgroundColor: isSelected ? 'var(--colors-gray750)' : 'var(--colors-gray800)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: 'translateY(0)',
        boxShadow: isSelected ? '0 0 0 1px var(--colors-dndRed)' : 'none'
      }}
    >
      {/* Custom Indicator */}
      {action.isCustom && (
        <Box
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--colors-purple500)',
            opacity: 0.8
          }}
        />
      )}

      {/* Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '8px'
        }}
      >
        <Text
          variant="heading"
          size="sm"
          title={action.name}
          style={{
            margin: 0,
            fontWeight: '600',
            color: 'var(--colors-gray100)',
            lineHeight: '1.3',
            flex: 1
          }}
        >
          {action.name}
        </Text>
        <Text
          variant="body"
          size="xs"
          style={{
            ...actionTypeStyle,
            fontWeight: '500',
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap'
          }}
        >
          {action.type}
        </Text>
      </Box>

      {/* Description */}
      {description && (
        <Text
          variant="body"
          size="sm"
          title={action.description}
          style={{
            margin: '0 0 8px 0',
            color: 'var(--colors-gray400)',
            lineHeight: '1.4'
          }}
        >
          {description}
        </Text>
      )}

      {/* Footer */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}
      >
        {/* Tags */}
        <Box
          style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          {level !== undefined && (
            <Text
              variant="body"
              size="xs"
              title="Spell Level"
              style={{
                fontWeight: '600',
                color: 'var(--colors-yellow400)',
                backgroundColor: 'var(--colors-yellow900)',
                padding: '2px 4px',
                borderRadius: '4px',
                minWidth: '20px',
                textAlign: 'center'
              }}
            >
              {level}
            </Text>
          )}
          {displayTags.map((tag: string, index: number) => (
            <Text
              key={index}
              variant="body"
              size="xs"
              style={{
                padding: '2px 4px',
                borderRadius: '4px',
                backgroundColor: 'var(--colors-gray700)',
                color: 'var(--colors-gray300)'
              }}
            >
              {tag}
            </Text>
          ))}
          {remainingTagsCount > 0 && (
            <Text
              variant="body"
              size="xs"
              title={action.tags.slice(3).join(', ')}
              style={{
                padding: '2px 4px',
                borderRadius: '4px',
                backgroundColor: 'var(--colors-gray700)',
                color: 'var(--colors-gray300)'
              }}
            >
              +{remainingTagsCount}
            </Text>
          )}
        </Box>

        {/* Actions */}
        {showEditButton && action.customizable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            title="Edit action"
            style={{
              width: '24px',
              height: '24px',
              padding: '0',
              borderRadius: '4px',
              backgroundColor: 'var(--colors-gray700)',
              color: 'var(--colors-gray300)',
              opacity: 0.7,
              transition: 'all 0.2s ease'
            }}
          >
            <Edit2 size={12} />
          </Button>
        )}
      </Box>
    </Box>
  )
}