import type { ComponentProps } from 'react'
import { gridRecipe, gridItemRecipe } from './Grid.css'

export type GridProps = {
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20
  autoFit?: boolean
  autoFill?: boolean
  responsive?: boolean | 'cards' | 'tokens'
  dense?: boolean
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'stretch'
} & Omit<ComponentProps<'div'>, 'className'>

export type GridItemProps = {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'full'
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto'
  colEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto'
} & Omit<ComponentProps<'div'>, 'className'>

export const Grid = ({
  columns,
  gap = 4,
  autoFit,
  autoFill,
  responsive,
  dense,
  align,
  justify,
  ...props
}: GridProps) => (
  <div
    {...props}
    className={gridRecipe({
      columns,
      gap,
      autoFit,
      autoFill,
      responsive,
      dense,
      align,
      justify
    })}
  />
)

export const GridItem = ({
  colSpan,
  rowSpan,
  colStart,
  colEnd,
  ...props
}: GridItemProps) => (
  <div
    {...props}
    className={gridItemRecipe({
      colSpan,
      rowSpan,
      colStart,
      colEnd
    })}
  />
)