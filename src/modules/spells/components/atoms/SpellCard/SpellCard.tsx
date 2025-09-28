/**
 * SpellCard Atom Component
 * Rich spell display with school badges, level indicators, and interaction controls
 */

import React from 'react'
import { Edit2 } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import type { UnifiedSpell } from '../../../types/spells'
import { SpellIcon } from '../SpellIcon'
import { SpellBadge } from '../SpellBadge'

interface SpellCardProps {
  spell: UnifiedSpell
  isSelected?: boolean
  showEditButton?: boolean
  onSelect?: (spell: UnifiedSpell) => void
  onEdit?: (spell: UnifiedSpell) => void
  className?: string
}


export const SpellCard: React.FC<SpellCardProps> = ({
  spell,
  isSelected = false,
  showEditButton = false,
  onSelect,
  onEdit,
  className
}) => {
  const handleCardClick = () => {
    onSelect?.(spell)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(spell)
  }

  // Truncate description if too long
  const description = spell.description && spell.description.length > 100
    ? `${spell.description.substring(0, 100)}...`
    : spell.description

  // Show first 3 tags, count remaining
  const visibleTags = spell.tags.slice(0, 3)
  const remainingTagsCount = spell.tags.length - 3

  return (
    <Box
      className={className}
      onClick={handleCardClick}
      style={{
        position: 'relative',
        padding: '12px',
        borderRadius: '12px',
        backgroundColor: isSelected ? 'var(--colors-gray200)' : 'var(--colors-gray100)',
        border: `2px solid ${isSelected ? 'var(--colors-dndRed)' : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Custom Indicator */}
      {spell.isCustom && (
        <Box
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--colors-violet600)'
          }}
        />
      )}

      {/* Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <SpellIcon school={spell.school} category={spell.category} />
          <Text
            variant="heading"
            size="sm"
            style={{
              margin: 0,
              fontWeight: '600',
              color: 'var(--colors-gray900)',
              lineHeight: '1.3'
            }}
          >
            {spell.name}
          </Text>
        </Box>
        {spell.type === 'area' && spell.size?.radius && (
          <SpellBadge
            variant="level"
            content={Math.floor((spell.size.radius / 25))} // Convert pixels to feet approximation
            title="Radius (5ft squares)"
          />
        )}
      </Box>

      {/* Badge Row */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '8px'
        }}
      >
        <SpellBadge
          variant="school"
          content={spell.school.toUpperCase()}
        />
        <SpellBadge
          variant="type"
          content={spell.type.toUpperCase()}
        />
      </Box>

      {/* Description */}
      {description && (
        <Text
          variant="body"
          size="xs"
          style={{
            margin: '4px 0 8px 0',
            color: 'var(--colors-gray700)',
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {description}
        </Text>
      )}

      {/* Tags Row */}
      <Box
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          alignItems: 'center'
        }}
      >
        {visibleTags.map((tag: string, index: number) => (
          <Text
            key={index}
            variant="body"
            size="xs"
            style={{
              color: 'var(--colors-gray600)',
              backgroundColor: 'var(--colors-gray300)',
              padding: '1px 4px',
              borderRadius: '4px'
            }}
          >
            {tag}
          </Text>
        ))}
        {remainingTagsCount > 0 && (
          <Text
            variant="body"
            size="xs"
            title={spell.tags.slice(3).join(', ')}
            style={{
              color: 'var(--colors-gray600)',
              backgroundColor: 'var(--colors-gray300)',
              padding: '1px 4px',
              borderRadius: '4px'
            }}
          >
            +{remainingTagsCount}
          </Text>
        )}
      </Box>

      {/* Edit Button */}
      {showEditButton && spell.customizable && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEditClick}
          title="Edit spell"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px',
            backgroundColor: 'var(--colors-gray800)',
            color: 'white',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            zIndex: 1
          }}
        >
          <Edit2 size={12} />
        </Button>
      )}
    </Box>
  )
}