import React, { useState } from 'react'
import { useAccessibility } from '@/hooks/useAccessibility'
import { Box, Text, Button } from '@/components/ui'
import { Modal, Select } from '@/components/ui'
import {
  Eye,
  Accessibility,
  Type,
  Volume2,
  Keyboard,
  Monitor,
  Palette,
  Zap,
  Info,
  Check
} from 'lucide-react'

interface AccessibilityPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isOpen,
  onClose
}) => {
  const {
    preferences,
    isScreenReaderActive,
    updatePreference,
    announceMessage
  } = useAccessibility()

  const [testMessage, setTestMessage] = useState('')

  const handleTestAnnouncement = () => {
    const message = testMessage || 'This is a test announcement for screen readers'
    announceMessage(message, 'assertive')
    setTestMessage('')
  }

  const handleQuickSetup = (preset: 'default' | 'screen-reader' | 'low-vision' | 'motor') => {
    switch (preset) {
      case 'screen-reader':
        updatePreference('screenReaderMode', true)
        updatePreference('announcements', true)
        updatePreference('keyboardNavigation', true)
        updatePreference('highContrast', false)
        updatePreference('reducedMotion', true)
        updatePreference('fontSize', 'medium')
        break

      case 'low-vision':
        updatePreference('highContrast', true)
        updatePreference('fontSize', 'extra-large')
        updatePreference('announcements', true)
        updatePreference('screenReaderMode', false)
        updatePreference('keyboardNavigation', true)
        updatePreference('reducedMotion', false)
        break

      case 'motor':
        updatePreference('keyboardNavigation', true)
        updatePreference('reducedMotion', true)
        updatePreference('announcements', false)
        updatePreference('screenReaderMode', false)
        updatePreference('highContrast', false)
        updatePreference('fontSize', 'large')
        break

      case 'default':
      default:
        updatePreference('screenReaderMode', false)
        updatePreference('announcements', true)
        updatePreference('keyboardNavigation', true)
        updatePreference('highContrast', false)
        updatePreference('reducedMotion', false)
        updatePreference('fontSize', 'medium')
        break
    }

    announceMessage(`Applied ${preset.replace('-', ' ')} accessibility preset`)
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Accessibility Settings">
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4', minWidth: 500, maxHeight: '80vh', overflow: 'auto' }}>

        {/* Screen Reader Detection */}
        <Box
          css={{
            padding: '$3',
            backgroundColor: isScreenReaderActive ? '$success' : '$gray800',
            borderRadius: '$md',
            display: 'flex',
            alignItems: 'center',
            gap: '$3'
          }}
        >
          <Eye size={20} />
          <Box css={{ flex: 1 }}>
            <Text css={{ fontSize: '$sm', fontWeight: '$medium' }}>
              Screen Reader: {isScreenReaderActive ? 'Detected' : 'Not Detected'}
            </Text>
            <Text css={{ fontSize: '$xs', color: '$gray400' }}>
              {isScreenReaderActive
                ? 'Optimizations will be applied automatically'
                : 'Enable screen reader mode for better compatibility'
              }
            </Text>
          </Box>
        </Box>

        {/* Quick Setup Presets */}
        <Box>
          <Text css={{ fontSize: '$md', fontWeight: '$semibold', marginBottom: '$3' }}>
            Quick Setup Presets
          </Text>

          <Box css={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '$2' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSetup('default')}
            >
              <Monitor size={16} />
              Default
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSetup('screen-reader')}
            >
              <Volume2 size={16} />
              Screen Reader
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSetup('low-vision')}
            >
              <Eye size={16} />
              Low Vision
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSetup('motor')}
            >
              <Keyboard size={16} />
              Motor Impairment
            </Button>
          </Box>
        </Box>

        {/* Visual Settings */}
        <Box
          css={{
            padding: '$3',
            backgroundColor: '$gray800',
            borderRadius: '$md'
          }}
        >
          <Text css={{ fontSize: '$sm', fontWeight: '$medium', marginBottom: '$3' }}>
            Visual Settings
          </Text>

          <Box css={{ display: 'flex', flexDirection: 'column', gap: '$3' }}>
            {/* High Contrast */}
            <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                <Palette size={16} />
                <Box>
                  <Text css={{ fontSize: '$sm' }}>High Contrast Mode</Text>
                  <Text css={{ fontSize: '$xs', color: '$gray400' }}>
                    Increases contrast for better visibility
                  </Text>
                </Box>
              </Box>
              <input
                type="checkbox"
                checked={preferences.highContrast}
                onChange={(e) => updatePreference('highContrast', e.target.checked)}
              />
            </Box>

            {/* Font Size */}
            <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                <Type size={16} />
                <Box>
                  <Text css={{ fontSize: '$sm' }}>Font Size</Text>
                  <Text css={{ fontSize: '$xs', color: '$gray400' }}>
                    Adjust text size throughout the app
                  </Text>
                </Box>
              </Box>
              <Select
                value={preferences.fontSize}
                onValueChange={(value) => updatePreference('fontSize', value as any)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </Select>
            </Box>

            {/* Reduced Motion */}
            <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                <Zap size={16} />
                <Box>
                  <Text css={{ fontSize: '$sm' }}>Reduce Motion</Text>
                  <Text css={{ fontSize: '$xs', color: '$gray400' }}>
                    Minimize animations and transitions
                  </Text>
                </Box>
              </Box>
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
              />
            </Box>
          </Box>
        </Box>

        {/* Navigation Settings */}
        <Box
          css={{
            padding: '$3',
            backgroundColor: '$gray800',
            borderRadius: '$md'
          }}
        >
          <Text css={{ fontSize: '$sm', fontWeight: '$medium', marginBottom: '$3' }}>
            Navigation & Input
          </Text>

          <Box css={{ display: 'flex', flexDirection: 'column', gap: '$3' }}>
            {/* Keyboard Navigation */}
            <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                <Keyboard size={16} />
                <Box>
                  <Text css={{ fontSize: '$sm' }}>Enhanced Keyboard Navigation</Text>
                  <Text css={{ fontSize: '$xs', color: '$gray400' }}>
                    Improved focus management and shortcuts
                  </Text>
                </Box>
              </Box>
              <input
                type="checkbox"
                checked={preferences.keyboardNavigation}
                onChange={(e) => updatePreference('keyboardNavigation', e.target.checked)}
              />
            </Box>
          </Box>
        </Box>

        {/* Screen Reader Settings */}
        <Box
          css={{
            padding: '$3',
            backgroundColor: '$gray800',
            borderRadius: '$md'
          }}
        >
          <Text css={{ fontSize: '$sm', fontWeight: '$medium', marginBottom: '$3' }}>
            Screen Reader Support
          </Text>

          <Box css={{ display: 'flex', flexDirection: 'column', gap: '$3' }}>
            {/* Screen Reader Mode */}
            <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                <Accessibility size={16} />
                <Box>
                  <Text css={{ fontSize: '$sm' }}>Screen Reader Mode</Text>
                  <Text css={{ fontSize: '$xs', color: '$gray400' }}>
                    Optimizes interface for screen readers
                  </Text>
                </Box>
              </Box>
              <input
                type="checkbox"
                checked={preferences.screenReaderMode}
                onChange={(e) => updatePreference('screenReaderMode', e.target.checked)}
              />
            </Box>

            {/* Announcements */}
            <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                <Volume2 size={16} />
                <Box>
                  <Text css={{ fontSize: '$sm' }}>Audio Announcements</Text>
                  <Text css={{ fontSize: '$xs', color: '$gray400' }}>
                    Announce important changes and actions
                  </Text>
                </Box>
              </Box>
              <input
                type="checkbox"
                checked={preferences.announcements}
                onChange={(e) => updatePreference('announcements', e.target.checked)}
              />
            </Box>
          </Box>
        </Box>

        {/* Test Announcements */}
        {preferences.announcements && (
          <Box
            css={{
              padding: '$3',
              backgroundColor: '$gray900',
              borderRadius: '$md',
              border: '1px solid $gray700'
            }}
          >
            <Text css={{ fontSize: '$sm', fontWeight: '$medium', marginBottom: '$2' }}>
              Test Announcements
            </Text>

            <Box css={{ display: 'flex', gap: '$2', marginBottom: '$2' }}>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter a test message..."
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '4px',
                  color: 'white'
                }}
              />
              <Button size="sm" onClick={handleTestAnnouncement}>
                <Volume2 size={14} />
                Test
              </Button>
            </Box>

            <Text css={{ fontSize: '$xs', color: '$gray400' }}>
              Use this to test how announcements sound with your screen reader
            </Text>
          </Box>
        )}

        {/* Accessibility Information */}
        <Box
          css={{
            padding: '$3',
            backgroundColor: '$primary',
            borderRadius: '$md',
            color: 'white'
          }}
        >
          <Box css={{ display: 'flex', alignItems: 'center', gap: '$2', marginBottom: '$2' }}>
            <Info size={16} />
            <Text css={{ fontSize: '$sm', fontWeight: '$medium' }}>
              Accessibility Features
            </Text>
          </Box>

          <Box css={{ display: 'flex', flexDirection: 'column', gap: '$1' }}>
            <Text css={{ fontSize: '$xs', opacity: 0.9 }}>
              • Full keyboard navigation with Tab and arrow keys
            </Text>
            <Text css={{ fontSize: '$xs', opacity: 0.9 }}>
              • ARIA labels and descriptions for all interactive elements
            </Text>
            <Text css={{ fontSize: '$xs', opacity: 0.9 }}>
              • Live regions for dynamic content updates
            </Text>
            <Text css={{ fontSize: '$xs', opacity: 0.9 }}>
              • High contrast and custom font size support
            </Text>
            <Text css={{ fontSize: '$xs', opacity: 0.9 }}>
              • Motion reduction for vestibular disorders
            </Text>
          </Box>
        </Box>

        {/* Keyboard Shortcuts */}
        <Box
          css={{
            padding: '$3',
            backgroundColor: '$gray800',
            borderRadius: '$md'
          }}
        >
          <Text css={{ fontSize: '$sm', fontWeight: '$medium', marginBottom: '$2' }}>
            Accessibility Shortcuts
          </Text>

          <Box css={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '$2', fontSize: '$xs' }}>
            <Text css={{ fontFamily: 'monospace', color: '$gray300' }}>Alt + A</Text>
            <Text css={{ color: '$gray400' }}>Open accessibility panel</Text>

            <Text css={{ fontFamily: 'monospace', color: '$gray300' }}>F1</Text>
            <Text css={{ color: '$gray400' }}>Open help dialog</Text>

            <Text css={{ fontFamily: 'monospace', color: '$gray300' }}>Escape</Text>
            <Text css={{ color: '$gray400' }}>Close dialogs and cancel actions</Text>

            <Text css={{ fontFamily: 'monospace', color: '$gray300' }}>Tab</Text>
            <Text css={{ color: '$gray400' }}>Navigate between interactive elements</Text>

            <Text css={{ fontFamily: 'monospace', color: '$gray300' }}>Space/Enter</Text>
            <Text css={{ color: '$gray400' }}>Activate buttons and controls</Text>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box css={{ display: 'flex', justifyContent: 'flex-end', gap: '$2', paddingTop: '$3' }}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              announceMessage('Accessibility settings saved successfully')
              onClose()
            }}
          >
            <Check size={16} />
            Save Settings
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default AccessibilityPanel