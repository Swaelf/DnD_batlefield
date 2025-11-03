import { forwardRef, type HTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const RoundCounter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.roundCounter} {...props} />
))
RoundCounter.displayName = 'RoundCounter'
