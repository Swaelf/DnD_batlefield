/**
 * PropertyValidation Molecule Component
 *
 * Validation summary and D&D compliance status display.
 * Follows molecular design patterns with 60-90 line constraint.
 */

import React from 'react'
import { AlertCircle, CheckCircle, Shield, Star } from 'lucide-react'
import { styled } from '@/styles/theme.config'
import { usePropertyValidation } from '../../../hooks'

interface PropertyValidationProps {
  objectId: string
  showDetailedErrors?: boolean
  className?: string
}

const ValidationContainer = styled('div', {
  padding: '$2',
  borderRadius: '$2',
  border: '1px solid $gray300',
  background: '$gray50',
  marginBottom: '$3'
})

const ValidationHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$2'
})

const ValidationStatus = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$sm',
  fontWeight: 500
})

const DNDStatus = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  padding: '$1 $2',
  borderRadius: '$2',
  fontSize: '$xs',
  fontWeight: 500,

  variants: {
    compliant: {
      true: {
        background: '$dndRed',
        color: 'white'
      },
      false: {
        background: '$yellow200',
        color: '$yellow800'
      }
    }
  }
})

const ValidationSummary = styled('div', {
  display: 'flex',
  gap: '$3',
  fontSize: '$xs',
  color: '$gray600'
})

const ValidationCount = styled('span', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',

  variants: {
    type: {
      error: { color: '$red600' },
      warning: { color: '$yellow600' },
      success: { color: '$green600' }
    }
  }
})

const ValidationDetails = styled('div', {
  marginTop: '$2',
  fontSize: '$xs'
})

const ValidationItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  margin: '$1 0',

  variants: {
    type: {
      error: { color: '$red600' },
      warning: { color: '$yellow600' }
    }
  }
})

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
    results,
    validate,
    clear
  } = usePropertyValidation(objectId)

  if (isValidating) {
    return (
      <ValidationContainer className={className}>
        <ValidationStatus>
          <AlertCircle size={16} />
          Validating properties...
        </ValidationStatus>
      </ValidationContainer>
    )
  }

  if (!hasErrors && !hasWarnings && isValid) {
    return (
      <ValidationContainer className={className}>
        <ValidationHeader>
          <ValidationStatus style={{ color: 'green' }}>
            <CheckCircle size={16} />
            All properties valid
          </ValidationStatus>
          <DNDStatus compliant={isDNDCompliant}>
            {isDNDCompliant ? <Shield size={12} /> : <Star size={12} />}
            {isDNDCompliant ? 'D&D Official' : 'Custom Values'}
          </DNDStatus>
        </ValidationHeader>
      </ValidationContainer>
    )
  }

  return (
    <ValidationContainer className={className}>
      <ValidationHeader>
        <ValidationStatus>
          {hasErrors ? (
            <>
              <AlertCircle size={16} color="red" />
              Property Issues Found
            </>
          ) : (
            <>
              <AlertCircle size={16} color="orange" />
              Validation Warnings
            </>
          )}
        </ValidationStatus>
        <DNDStatus compliant={isDNDCompliant}>
          {isDNDCompliant ? <Shield size={12} /> : <Star size={12} />}
          {isDNDCompliant ? 'D&D Official' : 'Custom Values'}
        </DNDStatus>
      </ValidationHeader>

      <ValidationSummary>
        {hasErrors && (
          <ValidationCount type="error">
            <AlertCircle size={12} />
            {errorCount} error{errorCount !== 1 ? 's' : ''}
          </ValidationCount>
        )}
        {hasWarnings && (
          <ValidationCount type="warning">
            <AlertCircle size={12} />
            {warningCount} warning{warningCount !== 1 ? 's' : ''}
          </ValidationCount>
        )}
        {hasDNDIssues && (
          <ValidationCount type="warning">
            <Star size={12} />
            Non-official D&D values
          </ValidationCount>
        )}
      </ValidationSummary>

      {showDetailedErrors && results.length > 0 && (
        <ValidationDetails>
          {results.map((result, index) => (
            <div key={index}>
              {result.errors.map((error, errorIndex) => (
                <ValidationItem key={`error-${index}-${errorIndex}`} type="error">
                  <AlertCircle size={12} />
                  <strong>{result.field}:</strong> {error}
                </ValidationItem>
              ))}
              {result.warnings.map((warning, warningIndex) => (
                <ValidationItem key={`warning-${index}-${warningIndex}`} type="warning">
                  <AlertCircle size={12} />
                  <strong>{result.field}:</strong> {warning}
                </ValidationItem>
              ))}
            </div>
          ))}
        </ValidationDetails>
      )}
    </ValidationContainer>
  )
}