/**
 * Formatting utility functions for displaying data
 * Pure functions for consistent data presentation
 */

import type { Point, TokenSize } from '../types'

// Number formatting
export const formatNumber = (value: number, decimals: number = 0): string => {
  return Number(value.toFixed(decimals)).toString()
}

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value * 100, decimals)}%`
}

export const formatDistance = (pixels: number, gridSize: number = 50): string => {
  const feet = (pixels / gridSize) * 5 // 1 square = 5 feet in D&D
  return `${formatNumber(feet)} ft`
}

// Coordinate formatting
export const formatPoint = (point: Point, decimals: number = 1): string => {
  return `(${formatNumber(point.x, decimals)}, ${formatNumber(point.y, decimals)})`
}

export const formatGridPosition = (point: Point, gridSize: number = 50): string => {
  const col = Math.round(point.x / gridSize)
  const row = Math.round(point.y / gridSize)
  return `${String.fromCharCode(65 + col)}${row + 1}`
}

// Size formatting
export const formatTokenSize = (size: TokenSize): string => {
  return size.charAt(0).toUpperCase() + size.slice(1)
}

export const formatPixelSize = (size: TokenSize, gridSize: number = 50): string => {
  const sizeMap: Record<TokenSize, number> = {
    tiny: 0.5,
    small: 1,
    medium: 1,
    large: 2,
    huge: 3,
    gargantuan: 4
  }

  const squares = sizeMap[size]
  const pixels = squares * gridSize
  return `${formatNumber(pixels)}px`
}

// Time formatting
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${formatNumber(milliseconds)}ms`
  }

  const seconds = milliseconds / 1000
  if (seconds < 60) {
    return `${formatNumber(seconds, 1)}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

// Color formatting
export const formatHexColor = (color: string): string => {
  if (color.startsWith('#')) {
    return color.toUpperCase()
  }
  return `#${color.toUpperCase()}`
}

export const formatRgbColor = (r: number, g: number, b: number, a?: number): string => {
  if (a !== undefined) {
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
  return `rgb(${r}, ${g}, ${b})`
}

// File size formatting
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${formatNumber(size, unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

// Text formatting
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - 3) + '...'
}

export const capitalizeFirst = (text: string): string => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const camelToKebab = (text: string): string => {
  return text.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const kebabToCamel = (text: string): string => {
  return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Validation formatting
export const formatValidationError = (field: string, message: string): string => {
  const formattedField = field.replace(/([A-Z])/g, ' $1').toLowerCase()
  return `${capitalizeFirst(formattedField)}: ${message}`
}

// Key combination formatting
export const formatKeyCombo = (keys: string[]): string => {
  return keys.map(key => key.charAt(0).toUpperCase() + key.slice(1)).join(' + ')
}