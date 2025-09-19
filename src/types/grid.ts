export type GridPoint = {
  x: number
  y: number
}

export type GridType = 'square' | 'hex'

export type GridSettings = {
  size: number
  type: GridType
  visible: boolean
  snap: boolean
  color: string
}