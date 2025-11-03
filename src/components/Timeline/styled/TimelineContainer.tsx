import { forwardRef, type HTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const TimelineContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.timelineContainer} {...props} />
))
TimelineContainer.displayName = 'TimelineContainer'
