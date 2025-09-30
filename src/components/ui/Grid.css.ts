import { recipe } from '@vanilla-extract/recipes'
import { vars } from '@/styles/theme.css'

export const gridRecipe = recipe({
  base: {
    display: 'grid'
  },

  variants: {
    columns: {
      1: { gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' },
      2: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
      3: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
      4: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
      5: { gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' },
      6: { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' },
      12: { gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }
    },

    gap: {
      0: { gap: 0 },
      1: { gap: vars.space[1] },
      2: { gap: vars.space[2] },
      3: { gap: vars.space[3] },
      4: { gap: vars.space[4] },
      5: { gap: vars.space[5] },
      6: { gap: vars.space[6] },
      8: { gap: vars.space[8] },
      10: { gap: vars.space[10] },
      12: { gap: vars.space[12] },
      16: { gap: vars.space[16] },
      20: { gap: vars.space[20] }
    },

    autoFit: {
      true: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))'
      }
    },

    autoFill: {
      true: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(0, 1fr))'
      }
    },

    responsive: {
      true: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
      },
      cards: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'
      },
      tokens: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))'
      }
    },

    dense: {
      true: {
        gridAutoFlow: 'dense'
      }
    },

    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' }
    },

    justify: {
      start: { justifyItems: 'start' },
      center: { justifyItems: 'center' },
      end: { justifyItems: 'end' },
      stretch: { justifyItems: 'stretch' }
    }
  },

  defaultVariants: {
    gap: 4
  }
})

export const gridItemRecipe = recipe({
  base: {},

  variants: {
    colSpan: {
      1: { gridColumn: 'span 1 / span 1' },
      2: { gridColumn: 'span 2 / span 2' },
      3: { gridColumn: 'span 3 / span 3' },
      4: { gridColumn: 'span 4 / span 4' },
      5: { gridColumn: 'span 5 / span 5' },
      6: { gridColumn: 'span 6 / span 6' },
      full: { gridColumn: '1 / -1' }
    },

    rowSpan: {
      1: { gridRow: 'span 1 / span 1' },
      2: { gridRow: 'span 2 / span 2' },
      3: { gridRow: 'span 3 / span 3' },
      4: { gridRow: 'span 4 / span 4' },
      5: { gridRow: 'span 5 / span 5' },
      6: { gridRow: 'span 6 / span 6' }
    },

    colStart: {
      1: { gridColumnStart: '1' },
      2: { gridColumnStart: '2' },
      3: { gridColumnStart: '3' },
      4: { gridColumnStart: '4' },
      5: { gridColumnStart: '5' },
      6: { gridColumnStart: '6' },
      auto: { gridColumnStart: 'auto' }
    },

    colEnd: {
      1: { gridColumnEnd: '1' },
      2: { gridColumnEnd: '2' },
      3: { gridColumnEnd: '3' },
      4: { gridColumnEnd: '4' },
      5: { gridColumnEnd: '5' },
      6: { gridColumnEnd: '6' },
      auto: { gridColumnEnd: 'auto' }
    }
  }
})