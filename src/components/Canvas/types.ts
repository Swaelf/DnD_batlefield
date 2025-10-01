/**
 * Canvas Component Types
 * Extracted from MapCanvas.tsx for better organization
 */

import type { MutableRefObject } from 'react'
import type { Token } from '@/types/token'
import type { MapObject } from '@/types/map'

export interface MapCanvasProps {
  readonly width: number
  readonly height: number
  readonly stageRef?: MutableRefObject<import('konva').default.Stage | null>
  readonly onMouseMove?: (position: { x: number; y: number }) => void
  readonly onZoomChange?: (zoom: number) => void
}

export interface SelectionRectangle {
  x: number
  y: number
  width: number
  height: number
  visible: boolean
}

export interface HPTooltipState {
  tokenId: string | null
  position: { x: number; y: number }
}

export type ObjectBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type IntersectableObject = MapObject | Token
