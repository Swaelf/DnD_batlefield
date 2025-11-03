import { forwardRef, type HTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const StatusSection = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.statusSection} {...props} />
))
StatusSection.displayName = 'StatusSection'
