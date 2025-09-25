/**
 * TokenSelector Molecule Component
 *
 * Dropdown token selection with search and preview functionality.
 * Used in event systems and property panels for token selection.
 * Molecular design: 60-90 lines, selection interface focus.
 */

import React from 'react'
import { styled } from '@/styles/theme.config'
import { ChevronDown, Search } from 'lucide-react'
import type { Token } from '../../../types'

export interface TokenSelectorProps {
  readonly tokens: readonly Token[]
  readonly selectedTokenId?: string
  readonly onChange: (tokenId: string) => void
  readonly placeholder?: string
  readonly searchable?: boolean
  readonly showPreview?: boolean
}

const SelectorContainer = styled('div', {
  position: 'relative',
  minWidth: '200px'
})

const SelectorButton = styled('button', {
  width: '100%',
  padding: '$2 $3',
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$md',
  color: '$gray100',
  fontSize: '$sm',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    borderColor: '$dndGold',
    backgroundColor: '$gray700'
  },

  '&:focus': {
    outline: 'none',
    borderColor: '$dndGold',
    boxShadow: '0 0 0 2px rgba(201, 173, 106, 0.2)'
  }
})

const SelectorDropdown = styled('div', {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 1000,
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$md',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  maxHeight: '300px',
  overflowY: 'auto'
})

const SearchInput = styled('input', {
  width: '100%',
  padding: '$2',
  backgroundColor: '$gray700',
  border: 'none',
  borderBottom: '1px solid $gray600',
  color: '$gray100',
  fontSize: '$sm',

  '&::placeholder': {
    color: '$gray400'
  },

  '&:focus': {
    outline: 'none',
    backgroundColor: '$gray600'
  }
})

const TokenOption = styled('div', {
  padding: '$2',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',

  '&:hover': {
    backgroundColor: '$gray700'
  },

  variants: {
    selected: {
      true: {
        backgroundColor: '$dndRed',
        color: '$gray100'
      }
    }
  }
})

const TokenPreview = styled('div', {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  border: '2px solid currentColor',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$xs',
  fontWeight: 'bold'
})

const TokenInfo = styled('div', {
  flex: 1
})

const TokenName = styled('div', {
  fontSize: '$sm',
  fontWeight: '500'
})

const TokenCategory = styled('div', {
  fontSize: '$xs',
  color: '$gray400',
  textTransform: 'capitalize'
})

export const TokenSelector: React.FC<TokenSelectorProps> = React.memo(({
  tokens,
  selectedTokenId,
  onChange,
  placeholder = 'Select token...',
  searchable = true,
  showPreview = true
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  const selectedToken = tokens.find(token => token.id === selectedTokenId)

  const filteredTokens = React.useMemo(() => {
    if (!searchTerm) return tokens

    return tokens.filter(token =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [tokens, searchTerm])

  const handleTokenSelect = React.useCallback((tokenId: string) => {
    onChange(tokenId)
    setIsOpen(false)
    setSearchTerm('')
  }, [onChange])

  return (
    <SelectorContainer>
      <SelectorButton onClick={() => setIsOpen(!isOpen)}>
        <span>
          {selectedToken ? selectedToken.name : placeholder}
        </span>
        <ChevronDown size={16} />
      </SelectorButton>

      {isOpen && (
        <SelectorDropdown>
          {searchable && (
            <SearchInput
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          )}

          {filteredTokens.map((token) => (
            <TokenOption
              key={token.id}
              selected={token.id === selectedTokenId}
              onClick={() => handleTokenSelect(token.id)}
            >
              {showPreview && (
                <TokenPreview style={{ backgroundColor: token.color }}>
                  {token.name.charAt(0).toUpperCase()}
                </TokenPreview>
              )}

              <TokenInfo>
                <TokenName>{token.name}</TokenName>
                <TokenCategory>{token.category}</TokenCategory>
              </TokenInfo>
            </TokenOption>
          ))}

          {filteredTokens.length === 0 && (
            <TokenOption>
              <TokenInfo>
                <TokenName>No tokens found</TokenName>
              </TokenInfo>
            </TokenOption>
          )}
        </SelectorDropdown>
      )}
    </SelectorContainer>
  )
})