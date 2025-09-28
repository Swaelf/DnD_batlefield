/**
 * PropertyValidation Molecule Component
 * Validation summary and D&D compliance status display
 */

import React from 'react'
import { AlertCircle, CheckCircle, Shield, Star } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { usePropertyValidation } from '../../../hooks'

interface PropertyValidationProps {
  objectId: string
  showDetailedErrors?: boolean
  className?: string
}


export const PropertyValidation: React.FC<PropertyValidationProps> = ({
  objectId,
  showDetailedErrors = false,
  className
}) => {
  const {
    isValidating,
    hasErrors,
    hasWarnings,
    hasDNDIssues,
    errorCount,
    warningCount,
    isValid,
    isDNDCompliant,
    results
  } = usePropertyValidation(objectId)

  if (isValidating) {
    return (
      <Box
        className={className}
        style={{
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid var(--colors-gray300)',
          backgroundColor: 'var(--colors-gray50)',
          marginBottom: '12px'
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <AlertCircle size={16} />
          <Text variant="body" size="sm">
            Validating properties...
          </Text>
        </Box>
      </Box>
    )
  }

  if (!hasErrors && !hasWarnings && isValid) {
    return (
      <Box
        className={className}
        style={{
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid var(--colors-gray300)',
          backgroundColor: 'var(--colors-gray50)',
          marginBottom: '12px'
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'green'
            }}
          >
            <CheckCircle size={16} />
            <Text variant="body" size="sm" style={{ color: 'green' }}>
              All properties valid
            </Text>
          </Box>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: isDNDCompliant ? 'var(--colors-dndRed)' : 'var(--colors-yellow200)',
              color: isDNDCompliant ? 'white' : 'var(--colors-yellow800)'
            }}
          >
            {isDNDCompliant ? <Shield size={12} /> : <Star size={12} />}
            <Text variant="body" size="xs">
              {isDNDCompliant ? 'D&D Official' : 'Custom Values'}
            </Text>
          </Box>
        </Box>
      </Box>
    )
  }

  const getCountColor = (type: 'error' | 'warning' | 'success') => {
    switch (type) {
      case 'error':
        return 'var(--colors-red600)'
      case 'warning':
        return 'var(--colors-yellow600)'
      case 'success':
        return 'var(--colors-green600)'
      default:
        return 'var(--colors-gray600)'
    }
  }

  const getItemColor = (type: 'error' | 'warning') => {
    switch (type) {
      case 'error':
        return 'var(--colors-red600)'
      case 'warning':
        return 'var(--colors-yellow600)'
      default:
        return 'var(--colors-gray600)'
    }
  }

  return (
    <Box
      className={className}
      style={{
        padding: '8px',
        borderRadius: '8px',
        border: '1px solid var(--colors-gray300)',
        backgroundColor: 'var(--colors-gray50)',
        marginBottom: '12px'
      }}
    >
      {/* Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {hasErrors ? (
            <>
              <AlertCircle size={16} color="red" />
              <Text variant="body" size="sm">
                Property Issues Found
              </Text>
            </>
          ) : (
            <>
              <AlertCircle size={16} color="orange" />
              <Text variant="body" size="sm">
                Validation Warnings
              </Text>
            </>
          )}
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: isDNDCompliant ? 'var(--colors-dndRed)' : 'var(--colors-yellow200)',
            color: isDNDCompliant ? 'white' : 'var(--colors-yellow800)'
          }}
        >
          {isDNDCompliant ? <Shield size={12} /> : <Star size={12} />}
          <Text variant="body" size="xs">
            {isDNDCompliant ? 'D&D Official' : 'Custom Values'}
          </Text>
        </Box>
      </Box>

      {/* Summary */}
      <Box
        style={{
          display: 'flex',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--colors-gray600)'
        }}
      >
        {hasErrors && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: getCountColor('error')
            }}
          >
            <AlertCircle size={12} />
            <Text variant="body" size="xs" style={{ color: getCountColor('error') }}>
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </Text>
          </Box>
        )}
        {hasWarnings && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: getCountColor('warning')
            }}
          >
            <AlertCircle size={12} />
            <Text variant="body" size="xs" style={{ color: getCountColor('warning') }}>
              {warningCount} warning{warningCount !== 1 ? 's' : ''}
            </Text>
          </Box>
        )}
        {hasDNDIssues && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: getCountColor('warning')
            }}
          >
            <Star size={12} />
            <Text variant="body" size="xs" style={{ color: getCountColor('warning') }}>
              Non-official D&D values
            </Text>
          </Box>
        )}
      </Box>

      {/* Detailed Errors */}
      {showDetailedErrors && results.length > 0 && (
        <Box
          style={{
            marginTop: '8px',
            fontSize: '12px'
          }}
        >
          {results.map((result, index) => (
            <Box key={index}>
              {result.errors.map((error, errorIndex) => (
                <Box
                  key={`error-${index}-${errorIndex}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    margin: '4px 0',
                    color: getItemColor('error')
                  }}
                >
                  <AlertCircle size={12} />
                  <Text variant="body" size="xs" style={{ color: getItemColor('error') }}>
                    <strong>{result.field}:</strong> {error}
                  </Text>
                </Box>
              ))}
              {result.warnings.map((warning, warningIndex) => (
                <Box
                  key={`warning-${index}-${warningIndex}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    margin: '4px 0',
                    color: getItemColor('warning')
                  }}
                >
                  <AlertCircle size={12} />
                  <Text variant="body" size="xs" style={{ color: getItemColor('warning') }}>
                    <strong>{result.field}:</strong> {warning}
                  </Text>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}