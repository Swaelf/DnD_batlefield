/**
 * TokenTemplate Molecule Component
 *
 * Template preview card for token library with category and metadata.
 * Handles click interactions and visual states for template selection.
 * Molecular design: 60-90 lines, template card focus.
 */

import React from 'react'
import { styled } from '@/styles/theme.config'
import type { TokenTemplate as TemplateType } from '../../../types'

export interface TokenTemplateProps {
  readonly template: TemplateType
  readonly onClick?: (template: TemplateType) => void
  readonly isActive?: boolean
  readonly showDescription?: boolean
}

const TemplateCard = styled('div', {
  padding: '$2',
  border: '2px solid $gray600',
  borderRadius: '$md',
  backgroundColor: '$gray800',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minHeight: '80px',

  '&:hover': {
    borderColor: '$dndGold',
    backgroundColor: '$gray700'
  },

  variants: {
    active: {
      true: {
        borderColor: '$dndGold',
        backgroundColor: '$gray700',
        boxShadow: '0 0 8px rgba(201, 173, 106, 0.4)'
      }
    }
  }
})

const TemplatePreview = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '2px solid $gray400',
  marginBottom: '$2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$sm',
  fontWeight: 'bold',
  color: '$gray100'
})

const TemplateName = styled('h4', {
  color: '$gray100',
  fontSize: '$sm',
  fontWeight: '600',
  margin: '0 0 $1 0'
})

const TemplateCategory = styled('span', {
  color: '$gray400',
  fontSize: '$xs',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
})

const TemplateDescription = styled('p', {
  color: '$gray300',
  fontSize: '$xs',
  margin: '$1 0 0 0',
  lineHeight: 1.3
})

const TemplateRarity = styled('span', {
  position: 'absolute',
  top: '$1',
  right: '$1',
  fontSize: '$xs',
  padding: '2px 6px',
  borderRadius: '$sm',

  variants: {
    rarity: {
      common: {
        backgroundColor: '$gray600',
        color: '$gray200'
      },
      uncommon: {
        backgroundColor: '$green600',
        color: '$green100'
      },
      rare: {
        backgroundColor: '$blue600',
        color: '$blue100'
      },
      custom: {
        backgroundColor: '$dndGold',
        color: '$gray900'
      }
    }
  }
})

export const TokenTemplate: React.FC<TokenTemplateProps> = React.memo(({
  template,
  onClick,
  isActive = false,
  showDescription = true
}) => {
  const handleClick = React.useCallback(() => {
    onClick?.(template)
  }, [onClick, template])

  return (
    <TemplateCard
      active={isActive}
      onClick={handleClick}
      style={{ position: 'relative' }}
    >
      <TemplateRarity rarity={template.rarity}>
        {template.rarity}
      </TemplateRarity>

      <TemplatePreview
        style={{ backgroundColor: template.defaults.color }}
      >
        {template.name.charAt(0).toUpperCase()}
      </TemplatePreview>

      <TemplateName>{template.name}</TemplateName>
      <TemplateCategory>{template.category}</TemplateCategory>

      {showDescription && template.description && (
        <TemplateDescription>{template.description}</TemplateDescription>
      )}
    </TemplateCard>
  )
})