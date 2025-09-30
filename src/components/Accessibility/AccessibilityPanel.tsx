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
  Info
} from '@/utils/optimizedIcons'

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
        updatePreference('screenReaderMode', false)
        updatePreference('announcements', false)
        updatePreference('keyboardNavigation', true)
        updatePreference('highContrast', true)
        updatePreference('reducedMotion', true)
        updatePreference('fontSize', 'large')
        break

      case 'motor':
        updatePreference('screenReaderMode', false)
        updatePreference('announcements', false)
        updatePreference('keyboardNavigation', true)
        updatePreference('highContrast', false)
        updatePreference('reducedMotion', true)
        updatePreference('fontSize', 'medium')
        break

      default:
        updatePreference('screenReaderMode', false)
        updatePreference('announcements', false)
        updatePreference('keyboardNavigation', false)
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
      <Box display="flex" flexDirection="column" gap={4} style={{ minWidth: 500, maxHeight: '80vh' }} overflow="auto">

        {/* Screen Reader Detection */}
        <Box
          padding={3}
          backgroundColor={isScreenReaderActive ? 'success' : 'backgroundTertiary'}
          borderRadius="md"
          display="flex"
          alignItems="center"
          gap={3}
        >
          <Eye size={20} />
          <Box flexGrow={1}>
            <Text size="sm" weight="medium">
              Screen Reader: {isScreenReaderActive ? 'Detected' : 'Not Detected'}
            </Text>
            <Text size="xs" color="gray400">
              {isScreenReaderActive
                ? 'Optimizations will be applied automatically'
                : 'Enable screen reader mode for better compatibility'
              }
            </Text>
          </Box>
        </Box>

        {/* Quick Setup Presets */}
        <Box>
          <Box marginBottom={3}>
            <Text size="md" weight="semibold" as="div">
              Quick Setup Presets
            </Text>
          </Box>

          <Box display="grid" gridTemplateColumns={2} gap={2}>
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
          padding={3}
          backgroundColor="backgroundTertiary"
          borderRadius="md"
        >
          <Box marginBottom={3}>
            <Text size="sm" weight="medium" as="div">
              Visual Settings
            </Text>
          </Box>

          <Box display="flex" flexDirection="column" gap={3}>
            {/* High Contrast */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Palette size={16} />
                <Box>
                  <Text size="sm">High Contrast Mode</Text>
                  <Text size="xs" color="gray400">
                    Increases contrast for better visibility
                  </Text>
                </Box>
              </Box>
              <input
                type="checkbox"
                checked={preferences.highContrast}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePreference('highContrast', e.target.checked)}
              />
            </Box>

            {/* Font Size */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Type size={16} />
                <Box>
                  <Text size="sm">Font Size</Text>
                  <Text size="xs" color="gray400">
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
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Zap size={16} />
                <Box>
                  <Text size="sm">Reduce Motion</Text>
                  <Text size="xs" color="gray400">
                    Minimize animations and transitions
                  </Text>
                </Box>
              </Box>
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePreference('reducedMotion', e.target.checked)}
              />
            </Box>
          </Box>
        </Box>

        {/* Navigation Settings */}
        <Box
          padding={3}
          backgroundColor="backgroundTertiary"
          borderRadius="md"
        >
          <Box marginBottom={3}>
            <Text size="sm" weight="medium" as="div">
              Navigation & Input
            </Text>
          </Box>

          <Box display="flex" flexDirection="column" gap={3}>
            {/* Keyboard Navigation */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Keyboard size={16} />
                <Box>
                  <Text size="sm">Enhanced Keyboard Navigation</Text>
                  <Text size="xs" color="gray400">
                    Improved focus management and shortcuts
                  </Text>
                </Box>
              </Box>
              <input
                type="checkbox"
                checked={preferences.keyboardNavigation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePreference('keyboardNavigation', e.target.checked)}
              />
            </Box>
          </Box>
        </Box>

        {/* Screen Reader Settings */}
        <Box
          padding={3}
          backgroundColor="backgroundTertiary"
          borderRadius="md"
        >
          <Box marginBottom={3}>
            <Text size="sm" weight="medium" as="div">
              Screen Reader Support
            </Text>
          </Box>

          <Box display="flex" flexDirection="column" gap={3}>
            {/* Screen Reader Mode */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Accessibility size={16} />
                <Box>
                  <Text size="sm">Screen Reader Mode</Text>
                  <Text size="xs" color="gray400">
                    Optimizes interface for screen readers
                  </Text>
                </Box>
              </Box>
              <input
                type="checkbox"
                checked={preferences.screenReaderMode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePreference('screenReaderMode', e.target.checked)}
              />
            </Box>

            {/* Announcements */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Volume2 size={16} />
                <Box>
                  <Text size="sm">Audio Announcements</Text>
                  <Text size="xs" color="gray400">
                    Enable audio feedback for actions
                  </Text>
                </Box>
              </Box>
              <input
                type="checkbox"
                checked={preferences.announcements}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePreference('announcements', e.target.checked)}
              />
            </Box>

            {/* Test Announcement */}
            <Box>
              <Box marginBottom={2}>
                <Text size="sm" as="div">Test Announcement</Text>
              </Box>
              <Box display="flex" gap={2}>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestMessage(e.target.value)}
                  placeholder="Enter test message..."
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#2A2A2A',
                    border: '1px solid #404040',
                    borderRadius: '4px',
                    color: '#E5E5E5'
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTestAnnouncement}
                >
                  <Volume2 size={16} />
                  Test
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Info Section */}
        <Box
          padding={3}
          backgroundColor="info"
          borderRadius="md"
          display="flex"
          alignItems="flex-start"
          gap={3}
        >
          <Info size={20} style={{ marginTop: 2 }} />
          <Box>
            <Box marginBottom={1}>
              <Text size="sm" weight="medium" as="div">
                Accessibility Information
              </Text>
            </Box>
            <Text size="xs" color="gray300">
              These settings help make MapMaker more accessible to users with
              different needs. Changes are applied immediately and saved to your
              preferences.
            </Text>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}