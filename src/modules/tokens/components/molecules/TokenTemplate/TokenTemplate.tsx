/**
 * TokenTemplate Molecule Component
 * Template preview card for token library with category and metadata
 */

import React from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import type { TokenTemplate as TemplateType } from '../../../types'

export interface TokenTemplateProps {
  readonly template: TemplateType
  readonly onClick?: (template: TemplateType) => void
  readonly isActive?: boolean
  readonly showDescription?: boolean
}


export const TokenTemplate: React.FC<TokenTemplateProps> = React.memo(({
  template,
  onClick,
  isActive = false,
  showDescription = true
}) => {
  const handleClick = React.useCallback(() => {
    onClick?.(template)
  }, [onClick, template])

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return { backgroundColor: 'var(--colors-gray600)', color: 'var(--colors-gray200)' }
      case 'uncommon':
        return { backgroundColor: 'var(--colors-green600)', color: 'var(--colors-green100)' }
      case 'rare':
        return { backgroundColor: 'var(--colors-blue600)', color: 'var(--colors-blue100)' }
      case 'custom':
        return { backgroundColor: 'var(--colors-dndGold)', color: 'var(--colors-gray900)' }
      default:
        return { backgroundColor: 'var(--colors-gray600)', color: 'var(--colors-gray200)' }
    }
  }

  const rarityColors = getRarityColors(template.rarity)

  return (
    <Box
      onClick={handleClick}
      style={{
        position: 'relative',
        padding: '8px',
        border: `2px solid ${isActive ? 'var(--colors-dndGold)' : 'var(--colors-gray600)'}`,
        borderRadius: '6px',
        backgroundColor: isActive ? 'var(--colors-gray700)' : 'var(--colors-gray800)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: '80px',
        boxShadow: isActive ? '0 0 8px rgba(201, 173, 106, 0.4)' : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'var(--colors-dndGold)'
          e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'var(--colors-gray600)'
          e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
        }
      }}
    >
      {/* Template Rarity Badge */}
      <Box
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          fontSize: '12px',
          padding: '2px 6px',
          borderRadius: '4px',
          ...rarityColors
        }}
      >
        <Text
          variant="label"
          size="xs"
          style={{
            color: 'inherit',
            textTransform: 'capitalize'
          }}
        >
          {template.rarity}
        </Text>
      </Box>

      {/* Template Preview Circle */}
      <Box
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '2px solid var(--colors-gray400)',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: template.defaults.color
        }}
      >
        <Text
          variant="body"
          size="sm"
          style={{
            fontWeight: 'bold',
            color: 'var(--colors-gray100)'
          }}
        >
          {template.name.charAt(0).toUpperCase()}
        </Text>
      </Box>

      {/* Template Name */}
      <Text
        variant="heading"
        size="sm"
        style={{
          color: 'var(--colors-gray100)',
          fontWeight: '600',
          margin: '0 0 4px 0'
        }}
      >
        {template.name}
      </Text>

      {/* Template Category */}
      <Text
        variant="label"
        size="xs"
        style={{
          color: 'var(--colors-gray400)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: showDescription && template.description ? '4px' : '0'
        }}
      >
        {template.category}
      </Text>

      {/* Template Description */}
      {showDescription && template.description && (
        <Text
          variant="body"
          size="xs"
          style={{
            color: 'var(--colors-gray300)',
            margin: '4px 0 0 0',
            lineHeight: 1.3
          }}
        >
          {template.description}
        </Text>
      )}
    </Box>
  )
})