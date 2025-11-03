/**
 * Validation utility functions for data integrity
 * Pure functions for validating user input and data structures
 */

import type { Point, Rectangle, Circle, Color, TokenSize } from '../types'

// Type guards
export const isPoint = (value: unknown): value is Point => {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    'x' in obj &&
    'y' in obj &&
    typeof obj.x === 'number' &&
    typeof obj.y === 'number'
  )
}

export const isRectangle = (value: unknown): value is Rectangle => {
  if (!isPoint(value)) return false
  const obj = value as Record<string, unknown>
  return (
    'width' in obj &&
    'height' in obj &&
    typeof obj.width === 'number' &&
    typeof obj.height === 'number' &&
    obj.width >= 0 &&
    obj.height >= 0
  )
}

export const isCircle = (value: unknown): value is Circle => {
  if (!isPoint(value)) return false
  const obj = value as Record<string, unknown>
  return (
    'radius' in obj &&
    typeof obj.radius === 'number' &&
    obj.radius >= 0
  )
}

// Number validators
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

export const isPositiveNumber = (value: unknown): value is number => {
  return isValidNumber(value) && value > 0
}

export const isNonNegativeNumber = (value: unknown): value is number => {
  return isValidNumber(value) && value >= 0
}

export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

// String validators
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0
}

export const isValidId = (value: unknown): value is string => {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]+$/.test(value)
}

export const isValidHexColor = (value: unknown): value is Color => {
  return typeof value === 'string' && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
}

// Size validators
export const isValidTokenSize = (value: unknown): value is TokenSize => {
  const validSizes: TokenSize[] = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan']
  return typeof value === 'string' && validSizes.includes(value as TokenSize)
}

// Geometric validators
export const isValidCoordinate = (x: number, y: number): boolean => {
  return isValidNumber(x) && isValidNumber(y)
}

export const isValidDimensions = (width: number, height: number): boolean => {
  return isPositiveNumber(width) && isPositiveNumber(height)
}

export const isValidRadius = (radius: number): boolean => {
  return isNonNegativeNumber(radius)
}

// Grid validators
export const isValidGridSize = (size: number): boolean => {
  return isPositiveNumber(size) && size >= 10 && size <= 200
}

export const isValidGridPosition = (point: Point, gridSize: number): boolean => {
  if (!isPoint(point) || !isValidGridSize(gridSize)) {
    return false
  }

  // Check if point aligns with grid
  const tolerance = 1
  return (
    Math.abs(point.x % gridSize) < tolerance ||
    Math.abs(point.x % gridSize) > gridSize - tolerance
  ) && (
    Math.abs(point.y % gridSize) < tolerance ||
    Math.abs(point.y % gridSize) > gridSize - tolerance
  )
}

// Map validators
export const isValidMapDimensions = (width: number, height: number): boolean => {
  return (
    isValidDimensions(width, height) &&
    width >= 100 &&
    height >= 100 &&
    width <= 10000 &&
    height <= 10000
  )
}

// File validators
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB

  return (
    validTypes.includes(file.type) &&
    file.size <= maxSize
  )
}

export const isValidJsonFile = (file: File): boolean => {
  return file.type === 'application/json' || file.name.endsWith('.json')
}

// Validation result types
export type ValidationResult<T> = {
  isValid: boolean
  data?: T
  errors: string[]
}

// Complex validation functions
export const validatePoint = (value: unknown): ValidationResult<Point> => {
  const errors: string[] = []

  if (!isPoint(value)) {
    errors.push('Value must be a valid point with x and y coordinates')
    return { isValid: false, errors }
  }

  if (!isValidNumber(value.x)) {
    errors.push('X coordinate must be a valid number')
  }

  if (!isValidNumber(value.y)) {
    errors.push('Y coordinate must be a valid number')
  }

  if (errors.length === 0) {
    return { isValid: true, data: value, errors: [] }
  }

  return { isValid: false, errors }
}

export const validateRectangle = (value: unknown): ValidationResult<Rectangle> => {
  const errors: string[] = []

  if (!isRectangle(value)) {
    errors.push('Value must be a valid rectangle')
    return { isValid: false, errors }
  }

  const pointValidation = validatePoint(value)
  if (!pointValidation.isValid) {
    errors.push(...pointValidation.errors)
  }

  if (!isNonNegativeNumber(value.width)) {
    errors.push('Width must be a non-negative number')
  }

  if (!isNonNegativeNumber(value.height)) {
    errors.push('Height must be a non-negative number')
  }

  if (errors.length === 0) {
    return { isValid: true, data: value, errors: [] }
  }

  return { isValid: false, errors }
}

export const validateCircle = (value: unknown): ValidationResult<Circle> => {
  const errors: string[] = []

  if (!isCircle(value)) {
    errors.push('Value must be a valid circle')
    return { isValid: false, errors }
  }

  const pointValidation = validatePoint(value)
  if (!pointValidation.isValid) {
    errors.push(...pointValidation.errors)
  }

  if (!isNonNegativeNumber(value.radius)) {
    errors.push('Radius must be a non-negative number')
  }

  if (errors.length === 0) {
    return { isValid: true, data: value, errors: [] }
  }

  return { isValid: false, errors }
}