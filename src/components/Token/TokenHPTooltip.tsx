import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import type { Token } from '@/types'
import { Heart, Shield } from 'lucide-react'

export type TokenHPTooltipProps = {
  token: Token
  position: { x: number; y: number }
  onUpdate: (updates: Partial<Token>) => void
  onClose?: () => void
}

const TokenHPTooltip = ({
  token,
  position,
  onUpdate,
  onClose
}: TokenHPTooltipProps) => {
  const [currentHP, setCurrentHP] = useState(token.currentHP || 0)
  const [maxHP, setMaxHP] = useState(token.maxHP || 0)
  const [tempHP, setTempHP] = useState(token.tempHP || 0)
  const [imageUrl, setImageUrl] = useState(token.image || '')
  const [showImageInput, setShowImageInput] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentHP(token.currentHP || 0)
    setMaxHP(token.maxHP || 0)
    setTempHP(token.tempHP || 0)
    setImageUrl(token.image || '')
  }, [token])

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleHPChange = (value: number) => {
    const newHP = Math.max(0, Math.min(value, maxHP || 100))
    setCurrentHP(newHP)
    onUpdate({ currentHP: newHP })
  }

  const handleMaxHPChange = (value: number) => {
    const newMaxHP = Math.max(1, value)
    setMaxHP(newMaxHP)
    onUpdate({ maxHP: newMaxHP })

    // Adjust current HP if it exceeds new max
    if (currentHP > newMaxHP) {
      setCurrentHP(newMaxHP)
      onUpdate({ currentHP: newMaxHP, maxHP: newMaxHP })
    } else {
      onUpdate({ maxHP: newMaxHP })
    }
  }

  const handleTempHPChange = (value: number) => {
    const newTempHP = Math.max(0, value)
    setTempHP(newTempHP)
    onUpdate({ tempHP: newTempHP })
  }

  const handleImageUrlSubmit = () => {
    const trimmedUrl = imageUrl.trim()
    if (trimmedUrl) {
      // Ensure URL is absolute
      let finalUrl = trimmedUrl
      if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('data:')) {
        // If it's a relative URL or just a filename, prepend https://
        if (trimmedUrl.includes('.')) {
          finalUrl = 'https://' + trimmedUrl
        }
      }
      onUpdate({ image: finalUrl })
      setImageUrl(finalUrl)
    } else {
      onUpdate({ image: undefined })
      setImageUrl('')
    }
    setShowImageInput(false)
  }

  const hpPercentage = (currentHP / (maxHP || 1)) * 100
  const hpColor = hpPercentage > 50 ? '#22C55E' : hpPercentage > 25 ? '#EAB308' : '#DC2626'

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
    >
      <div
        ref={tooltipRef}
        style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
          border: '2px solid #C9AD6A',
          borderRadius: '8px',
          padding: '12px',
          minWidth: '200px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
          zIndex: 1000
        }}
      >
        {/* Token Name Header */}
        <div style={{
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #444'
        }}>
          <h3 style={{
            color: '#C9AD6A',
            margin: 0,
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {token.name || 'Token'}
          </h3>
        </div>

        {/* HP Display */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <Heart size={16} color="#DC2626" />
            <span style={{ color: '#999', fontSize: '12px' }}>Hit Points</span>
          </div>

          {/* HP Bar */}
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              width: `${hpPercentage}%`,
              height: '100%',
              backgroundColor: hpColor,
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* HP Values */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <input
              type="number"
              value={currentHP}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleHPChange(parseInt(e.target.value) || 0)}
              title="Current HP"
              style={{
                width: '60px',
                padding: '4px',
                backgroundColor: '#2A2A2A',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'center'
              }}
            />
            <span style={{ color: '#666', fontSize: '14px', margin: '0 4px' }}>/</span>
            <input
              type="number"
              value={maxHP}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMaxHPChange(parseInt(e.target.value) || 1)}
              title="Max HP"
              style={{
                width: '60px',
                padding: '4px',
                backgroundColor: '#2A2A2A',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'center'
              }}
            />
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
            marginBottom: '8px'
          }}>
            <button
              onClick={() => handleHPChange(currentHP - 5)}
              style={{
                padding: '4px',
                backgroundColor: '#2A2A2A',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Damage 5"
            >
              -5
            </button>
            <button
              onClick={() => handleHPChange(currentHP - 1)}
              style={{
                padding: '4px',
                backgroundColor: '#2A2A2A',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Damage 1"
            >
              -1
            </button>
            <button
              onClick={() => handleHPChange(currentHP + 1)}
              style={{
                padding: '4px',
                backgroundColor: '#2A2A2A',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Heal 1"
            >
              +1
            </button>
            <button
              onClick={() => handleHPChange(currentHP + 5)}
              style={{
                padding: '4px',
                backgroundColor: '#2A2A2A',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Heal 5"
            >
              +5
            </button>
          </div>

          {/* Preset Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '4px'
          }}>
            <button
              onClick={() => handleHPChange(maxHP)}
              style={{
                padding: '6px',
                backgroundColor: '#22C55E',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              title="Heal to full"
            >
              Full Heal
            </button>
            <button
              onClick={() => handleHPChange(0)}
              style={{
                padding: '6px',
                backgroundColor: '#DC2626',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              title="Knock out"
            >
              KO
            </button>
          </div>
        </div>

        {/* Temp HP Section */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <Shield size={14} color="#3B82F6" />
            <span style={{ color: '#999', fontSize: '12px' }}>Temp HP</span>
          </div>
          <input
            type="number"
            value={tempHP}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTempHPChange(parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '4px',
              backgroundColor: '#2A2A2A',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              textAlign: 'center'
            }}
          />
        </div>

        {/* Token Image Section */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ color: '#999', fontSize: '12px' }}>Token Image</span>
            <button
              onClick={() => setShowImageInput(!showImageInput)}
              style={{
                padding: '2px 8px',
                backgroundColor: '#2A2A2A',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#C9AD6A',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              {showImageInput ? 'Cancel' : (imageUrl ? 'Change' : 'Add')}
            </button>
          </div>

          {showImageInput && (
            <div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL (e.g., imgur.com/abc.png)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleImageUrlSubmit()
                    if (e.key === 'Escape') setShowImageInput(false)
                  }}
                  style={{
                    flex: 1,
                    padding: '4px',
                    backgroundColor: '#2A2A2A',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <button
                  onClick={handleImageUrlSubmit}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#22C55E',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Set
                </button>
              </div>
              <div style={{
                fontSize: '9px',
                color: '#666',
                marginBottom: '4px'
              }}>
                Use direct image URLs (CORS-enabled)
              </div>
            </div>
          )}

          {imageUrl && !showImageInput && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              padding: '8px',
              backgroundColor: '#2A2A2A',
              borderRadius: '4px',
              border: '1px solid #444'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={imageUrl}
                  alt="Token"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #C9AD6A',
                    backgroundColor: '#1A1A1A'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                    // Show error message
                    const errorDiv = document.createElement('div')
                    errorDiv.style.color = '#DC2626'
                    errorDiv.style.fontSize = '11px'
                    errorDiv.textContent = 'Failed to load image'
                    target.parentElement?.appendChild(errorDiv)
                  }}
                  onLoad={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'block'
                  }}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '10px',
                    color: '#999',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {imageUrl}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setImageUrl('')
                  onUpdate({ image: undefined })
                }}
                style={{
                  padding: '2px 6px',
                  backgroundColor: '#DC2626',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

TokenHPTooltip.displayName = 'TokenHPTooltip'

export default TokenHPTooltip