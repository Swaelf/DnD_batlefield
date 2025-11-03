import type { ComponentProps } from 'react'
import { gridItemRecipe } from '../Grid.css'

export type GridItemProps = {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'full'
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto'
  colEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto'
} & Omit<ComponentProps<'div'>, 'className'>

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
