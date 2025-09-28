import { sprinkles, type Sprinkles } from '../sprinkles.css'
// import { vars } from '../theme.css' // TODO: Use theme vars when needed

// Create atomic style helpers for common patterns
export const atoms = {
  // Reset styles
  reset: sprinkles({
    margin: 0,
    padding: 0,
    borderWidth: 0,
  }),

  // Layout atoms
  flex: sprinkles({
    display: 'flex',
  }),

  flexColumn: sprinkles({
    display: 'flex',
    flexDirection: 'column',
  }),

  flexRow: sprinkles({
    display: 'flex',
    flexDirection: 'row',
  }),

  flexCenter: sprinkles({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  flexBetween: sprinkles({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),

  grid: sprinkles({
    display: 'grid',
  }),

  // Positioning atoms
  relative: sprinkles({
    position: 'relative',
  }),

  absolute: sprinkles({
    position: 'absolute',
  }),

  fixed: sprinkles({
    position: 'fixed',
  }),

  // Size atoms
  fullWidth: sprinkles({
    width: 'full',
  }),

  fullHeight: sprinkles({
    height: 'full',
  }),

  fullSize: sprinkles({
    width: 'full',
    height: 'full',
  }),

  // Interactive atoms
  clickable: sprinkles({
    cursor: 'pointer',
  }),

  notClickable: sprinkles({
    cursor: 'not-allowed',
  }),

  // Visual atoms
  hidden: sprinkles({
    display: 'none',
  }),

  visible: sprinkles({
    opacity: 100,
  }),

  invisible: sprinkles({
    opacity: 0,
  }),

  // Text atoms
  textLeft: sprinkles({
    textAlign: 'left',
  }),

  textCenter: sprinkles({
    textAlign: 'center',
  }),

  textRight: sprinkles({
    textAlign: 'right',
  }),

  // Truncation
  truncate: sprinkles({
    overflow: 'hidden',
  }),

  // Border atoms
  rounded: sprinkles({
    borderRadius: 'md',
  }),

  roundedFull: sprinkles({
    borderRadius: 'full',
  }),

  // Shadow atoms
  shadow: sprinkles({
    boxShadow: 'md',
  }),

  shadowLarge: sprinkles({
    boxShadow: 'lg',
  }),

  // Transition atoms
  transition: sprinkles({
    transition: 'all',
  }),

  transitionColors: sprinkles({
    transition: 'colors',
  }),
}

// Create responsive atomic helpers
export const responsiveAtoms = {
  hideOnMobile: sprinkles({
    display: { mobile: 'none', tablet: 'block' },
  }),

  hideOnDesktop: sprinkles({
    display: { mobile: 'block', desktop: 'none' },
  }),

  stackOnMobile: sprinkles({
    flexDirection: { mobile: 'column', tablet: 'row' },
  }),
}

// Common spacing patterns
export const spacing = {
  // Padding patterns
  p0: sprinkles({ padding: 0 }),
  p1: sprinkles({ padding: 1 }),
  p2: sprinkles({ padding: 2 }),
  p3: sprinkles({ padding: 3 }),
  p4: sprinkles({ padding: 4 }),
  p6: sprinkles({ padding: 6 }),
  p8: sprinkles({ padding: 8 }),

  // Margin patterns
  m0: sprinkles({ margin: 0 }),
  m1: sprinkles({ margin: 1 }),
  m2: sprinkles({ margin: 2 }),
  m3: sprinkles({ margin: 3 }),
  m4: sprinkles({ margin: 4 }),
  m6: sprinkles({ margin: 6 }),
  m8: sprinkles({ margin: 8 }),

  // Gap patterns
  gap1: sprinkles({ gap: 1 }),
  gap2: sprinkles({ gap: 2 }),
  gap3: sprinkles({ gap: 3 }),
  gap4: sprinkles({ gap: 4 }),
  gap6: sprinkles({ gap: 6 }),
  gap8: sprinkles({ gap: 8 }),
}

// Export type for atomic props
export type AtomicProps = Sprinkles

// Helper to combine atomic styles
export function combineAtoms(...atomClasses: (string | undefined | null | false)[]): string {
  return atomClasses.filter(Boolean).join(' ')
}

// Create semantic color atoms
export const colorAtoms = {
  // Text colors
  textPrimary: sprinkles({ color: 'text' }),
  textSecondary: sprinkles({ color: 'textSecondary' }),
  textTertiary: sprinkles({ color: 'textTertiary' }),
  textDanger: sprinkles({ color: 'error' }),
  textSuccess: sprinkles({ color: 'success' }),
  textWarning: sprinkles({ color: 'warning' }),

  // Background colors
  bgPrimary: sprinkles({ backgroundColor: 'primary' }),
  bgSecondary: sprinkles({ backgroundColor: 'secondary' }),
  bgSurface: sprinkles({ backgroundColor: 'surface' }),
  bgBackground: sprinkles({ backgroundColor: 'background' }),
  bgTransparent: sprinkles({ backgroundColor: 'transparent' }),

  // Border colors
  borderNeutral: sprinkles({ borderColor: 'border' }),
  borderPrimary: sprinkles({ borderColor: 'primary' }),
  borderSecondary: sprinkles({ borderColor: 'secondary' }),
  borderDanger: sprinkles({ borderColor: 'error' }),
}

// Typography atoms
export const typeAtoms = {
  // Font sizes
  textXs: sprinkles({ fontSize: 'xs' }),
  textSm: sprinkles({ fontSize: 'sm' }),
  textMd: sprinkles({ fontSize: 'md' }),
  textLg: sprinkles({ fontSize: 'lg' }),
  textXl: sprinkles({ fontSize: 'xl' }),
  text2Xl: sprinkles({ fontSize: '2xl' }),

  // Font weights
  fontNormal: sprinkles({ fontWeight: 'normal' }),
  fontMedium: sprinkles({ fontWeight: 'medium' }),
  fontSemibold: sprinkles({ fontWeight: 'semibold' }),
  fontBold: sprinkles({ fontWeight: 'bold' }),

  // Line heights
  leadingNone: sprinkles({ lineHeight: 'none' }),
  leadingTight: sprinkles({ lineHeight: 'tight' }),
  leadingNormal: sprinkles({ lineHeight: 'normal' }),
  leadingRelaxed: sprinkles({ lineHeight: 'relaxed' }),
}