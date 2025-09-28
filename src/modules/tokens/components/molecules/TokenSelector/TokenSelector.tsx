/**
 * TokenSelector Molecule Component
 * Dropdown token selection with search and preview functionality
 */

import React from 'react'
import { ChevronDown } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import type { Token } from '../../../types'

export interface TokenSelectorProps {
  readonly tokens: readonly Token[]
  readonly selectedTokenId?: string
  readonly onChange: (tokenId: string) => void
  readonly placeholder?: string
  readonly searchable?: boolean
  readonly showPreview?: boolean
}


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
    <Box
      style={{
        position: 'relative',
        minWidth: '200px'
      }}
    >
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: 'var(--colors-gray800)',
          border: '1px solid var(--colors-gray600)',
          borderRadius: '8px',
          color: 'var(--colors-gray100)',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
      >
        <Text variant="body" size="sm">
          {selectedToken ? selectedToken.name : placeholder}
        </Text>
        <ChevronDown size={16} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <Box
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'var(--colors-gray800)',
            border: '1px solid var(--colors-gray600)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {/* Search Input */}
          {searchable && (
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'var(--colors-gray700)',
                border: 'none',
                borderBottom: '1px solid var(--colors-gray600)',
                color: 'var(--colors-gray100)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          )}

          {/* Token Options */}
          {filteredTokens.map((token) => (
            <Box
              key={token.id}
              onClick={() => handleTokenSelect(token.id)}
              style={{
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                backgroundColor: token.id === selectedTokenId ? 'var(--colors-dndRed)' : 'transparent',
                color: token.id === selectedTokenId ? 'var(--colors-gray100)' : 'inherit'
              }}
            >
              {/* Token Preview */}
              {showPreview && (
                <Box
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid currentColor',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: token.color || 'var(--colors-gray600)'
                  }}
                >
                  {token.name.charAt(0).toUpperCase()}
                </Box>
              )}

              {/* Token Info */}
              <Box style={{ flex: 1 }}>
                <Text
                  variant="body"
                  size="sm"
                  style={{
                    fontWeight: '500',
                    margin: 0
                  }}
                >
                  {token.name}
                </Text>
                <Text
                  variant="body"
                  size="xs"
                  style={{
                    color: 'var(--colors-gray400)',
                    textTransform: 'capitalize',
                    margin: 0
                  }}
                >
                  {token.category}
                </Text>
              </Box>
            </Box>
          ))}

          {/* Empty State */}
          {filteredTokens.length === 0 && (
            <Box
              style={{
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Box style={{ flex: 1 }}>
                <Text
                  variant="body"
                  size="sm"
                  style={{
                    fontWeight: '500',
                    color: 'var(--colors-gray400)'
                  }}
                >
                  No tokens found
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
})