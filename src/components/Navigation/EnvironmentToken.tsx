/**
 * Environment Token Component
 * Displays a fixed-position token representing environmental spell sources
 * Located under the navigation pad, locked to screen position
 */

import React from 'react'
import { Cloud } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'

export const EnvironmentToken: React.FC = () => {
  return (
    <Box
      style={{
        position: 'fixed',
        bottom: '40px',
        left: '10px',
        zIndex: 100,
        width: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {/* Token Visual */}
      <Box
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#2A2A2A',
          border: '2px solid #3B82F6',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
          transition: 'all 0.2s ease'
        }}
        title="Environment Token - Source for environmental spells and effects"
      >
        <Cloud size={32} color="#3B82F6" strokeWidth={1.5} />
      </Box>

      {/* Label */}
      <Text
        variant="body"
        size="xs"
        style={{
          color: '#9CA3AF',
          textAlign: 'center',
          fontSize: '10px',
          fontWeight: 500
        }}
      >
        Environment
      </Text>
    </Box>
  )
}
