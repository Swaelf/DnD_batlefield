/**
 * SpellCard Atom Component
 *
 * Rich spell display with school badges, level indicators, and interaction controls.
 * Follows atomic design patterns similar to ActionCard from Actions module.
 */

import React from 'react'
import { Edit2 } from 'lucide-react'
import { styled } from '@/styles/theme.config'
import type { UnifiedSpell } from '../../types'
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

const Card = styled('div', {
  position: 'relative',
  padding: '$3',
  borderRadius: '$3',
  background: '$gray100',
  border: '2px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: '$gray200',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },

  variants: {
    selected: {
      true: {
        borderColor: '$dndRed',
        background: '$gray200'
      }
    }
  }
})

const Header = styled('div', {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '$2'
})

const SpellName = styled('h3', {
  margin: 0,
  fontSize: '$sm',
  fontWeight: 600,
  color: '$gray900',
  lineHeight: 1.3
})

const SpellDescription = styled('p', {
  margin: '$1 0 $2 0',
  fontSize: '$xs',
  color: '$gray700',
  lineHeight: 1.4,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  '-webkit-line-clamp': 2,
  '-webkit-box-orient': 'vertical'
})

const BadgeRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  marginBottom: '$2'
})

const TagsRow = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$1',
  alignItems: 'center'
})

const Tag = styled('span', {
  fontSize: '$xs',
  color: '$gray600',
  background: '$gray300',
  padding: '1px 4px',
  borderRadius: '$1'
})

const EditButton = styled('button', {
  position: 'absolute',
  top: '$2',
  right: '$2',
  padding: '$1',
  background: '$gray800',
  color: 'white',
  border: 'none',
  borderRadius: '$2',
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  zIndex: 1,

  '&:hover': {
    background: '$gray900'
  },

  [`${Card}:hover &`]: {
    opacity: 1
  }
})

const CustomIndicator = styled('div', {
  position: 'absolute',
  top: '$1',
  left: '$1',
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: '$violet600'
})

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
    <Card
      selected={isSelected}
      onClick={handleCardClick}
      className={className}
    >
      {spell.isCustom && <CustomIndicator />}

      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SpellIcon school={spell.school} category={spell.category} />
          <SpellName>{spell.name}</SpellName>
        </div>
        {spell.type === 'area' && spell.size?.radius && (
          <SpellBadge
            variant="level"
            content={Math.floor((spell.size.radius / 25))} // Convert pixels to feet approximation
            title="Radius (5ft squares)"
          />
        )}
      </Header>

      <BadgeRow>
        <SpellBadge
          variant="school"
          content={spell.school.toUpperCase()}
        />
        <SpellBadge
          variant="type"
          content={spell.type.toUpperCase()}
        />
      </BadgeRow>

      {description && (
        <SpellDescription>{description}</SpellDescription>
      )}

      <TagsRow>
        {visibleTags.map((tag, index) => (
          <Tag key={index}>{tag}</Tag>
        ))}
        {remainingTagsCount > 0 && (
          <Tag title={spell.tags.slice(3).join(', ')}>
            +{remainingTagsCount}
          </Tag>
        )}
      </TagsRow>

      {showEditButton && spell.customizable && (
        <EditButton
          onClick={handleEditClick}
          title="Edit spell"
        >
          <Edit2 size={12} />
        </EditButton>
      )}
    </Card>
  )
}