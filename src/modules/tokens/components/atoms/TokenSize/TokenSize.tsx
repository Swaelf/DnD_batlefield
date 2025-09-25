/**
 * TokenSize Atom Component
 *
 * Utility component for size calculations and D&D size compliance.
 * Not a visual component, but provides size computation logic.
 * Atomic design: 25-40 lines, size calculation focus.
 */

import React from 'react'
import type { TokenSize as SizeType } from '../../../types'
import { getTokenRadius, getTokenDiameter, getGridSquares } from '../../../constants'

export interface TokenSizeProps {
  readonly size: SizeType
  readonly gridSize: number
  readonly children: (sizeData: TokenSizeData) => React.ReactNode
}

export interface TokenSizeData {
  readonly radius: number
  readonly diameter: number
  readonly gridSquares: number
  readonly pixelSize: number
}

export const TokenSize: React.FC<TokenSizeProps> = ({
  size,
  gridSize,
  children
}) => {
  const radius = getTokenRadius(size, gridSize)
  const diameter = getTokenDiameter(size, gridSize)
  const gridSquares = getGridSquares(size)
  const pixelSize = diameter

  const sizeData: TokenSizeData = {
    radius,
    diameter,
    gridSquares,
    pixelSize
  }

  return <>{children(sizeData)}</>
}