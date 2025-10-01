// Converted to Vanilla Extract CSS
import * as styles from './CombatTracker.css'
import { forwardRef, type HTMLAttributes, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react'

export const TrackerContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.trackerContainer} {...props} />
))
TrackerContainer.displayName = 'TrackerContainer'

export const StartCombatButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button ref={ref} className={styles.startCombatButton} {...props} />
))
StartCombatButton.displayName = 'StartCombatButton'

export const CombatPanel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.combatPanel} {...props} />
))
CombatPanel.displayName = 'CombatPanel'

export const CombatBar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.combatBar} {...props} />
))
CombatBar.displayName = 'CombatBar'

export const ExpandedSection = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.expandedSection} {...props} />
))
ExpandedSection.displayName = 'ExpandedSection'

// Additional styled components that other files need
export const RoundCounter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.roundCounter} {...props} />
))
RoundCounter.displayName = 'RoundCounter'

export const NavControls = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.navControls} {...props} />
))
NavControls.displayName = 'NavControls'

export const NavButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button ref={ref} className={styles.navButton} {...props} />
))
NavButton.displayName = 'NavButton'

export const NextRoundButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button ref={ref} className={styles.nextRoundButton} {...props} />
))
NextRoundButton.displayName = 'NextRoundButton'

export const StatusSection = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.statusSection} {...props} />
))
StatusSection.displayName = 'StatusSection'

export const EventsButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button ref={ref} className={styles.eventsButton} {...props} />
))
EventsButton.displayName = 'EventsButton'

export const StatusIndicator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.statusIndicator} {...props} />
))
StatusIndicator.displayName = 'StatusIndicator'

export const ControlButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button ref={ref} className={styles.controlButton} {...props} />
))
ControlButton.displayName = 'ControlButton'

export const TimelineContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.timelineContainer} {...props} />
))
TimelineContainer.displayName = 'TimelineContainer'

export const RoundButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button ref={ref} className={styles.roundButton} {...props} />
))
RoundButton.displayName = 'RoundButton'

export const EventIndicator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.eventIndicator} {...props} />
))
EventIndicator.displayName = 'EventIndicator'

export const SpeedControl = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.speedControl} {...props} />
))
SpeedControl.displayName = 'SpeedControl'

export const SpeedLabel = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>((props, ref) => (
  <span ref={ref} className={styles.speedLabel} {...props} />
))
SpeedLabel.displayName = 'SpeedLabel'

export const SpeedInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input ref={ref} className={styles.speedInput} {...props} />
))
SpeedInput.displayName = 'SpeedInput'

export const SpeedValue = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>((props, ref) => (
  <span ref={ref} className={styles.speedValue} {...props} />
))
SpeedValue.displayName = 'SpeedValue'

export const StatsGrid = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.statsGrid} {...props} />
))
StatsGrid.displayName = 'StatsGrid'

export const StatCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.statCard} {...props} />
))
StatCard.displayName = 'StatCard'

export const StatLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.statLabel} {...props} />
))
StatLabel.displayName = 'StatLabel'

export const StatValue = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.statValue} {...props} />
))
StatValue.displayName = 'StatValue'