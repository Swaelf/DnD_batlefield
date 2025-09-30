// Converted to Vanilla Extract CSS
import * as styles from './CombatTracker.css'
import React from 'react'

export const TrackerContainer = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.trackerContainer} {...props} />
))

export const StartCombatButton = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
  <button ref={ref} className={styles.startCombatButton} {...props} />
))

export const CombatPanel = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.combatPanel} {...props} />
))

export const CombatBar = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.combatBar} {...props} />
))

export const ExpandedSection = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.expandedSection} {...props} />
))

// Additional styled components that other files need
export const RoundCounter = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.roundCounter} {...props} />
))

export const NavControls = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.navControls} {...props} />
))

export const NavButton = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
  <button ref={ref} className={styles.navButton} {...props} />
))

export const NextRoundButton = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
  <button ref={ref} className={styles.nextRoundButton} {...props} />
))

export const StatusSection = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.statusSection} {...props} />
))

export const EventsButton = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
  <button ref={ref} className={styles.eventsButton} {...props} />
))

export const StatusIndicator = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.statusIndicator} {...props} />
))

export const ControlButton = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
  <button ref={ref} className={styles.controlButton} {...props} />
))

export const TimelineContainer = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.timelineContainer} {...props} />
))

export const RoundButton = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
  <button ref={ref} className={styles.roundButton} {...props} />
))

export const EventIndicator = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.eventIndicator} {...props} />
))

export const SpeedControl = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.speedControl} {...props} />
))

export const SpeedLabel = React.forwardRef<HTMLSpanElement, any>((props, ref) => (
  <span ref={ref} className={styles.speedLabel} {...props} />
))

export const SpeedInput = React.forwardRef<HTMLInputElement, any>((props, ref) => (
  <input ref={ref} className={styles.speedInput} {...props} />
))

export const SpeedValue = React.forwardRef<HTMLSpanElement, any>((props, ref) => (
  <span ref={ref} className={styles.speedValue} {...props} />
))

export const StatsGrid = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.statsGrid} {...props} />
))

export const StatCard = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.statCard} {...props} />
))

export const StatLabel = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.statLabel} {...props} />
))

export const StatValue = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} className={styles.statValue} {...props} />
))

// Add displayName to all components to avoid React warnings
TrackerContainer.displayName = 'TrackerContainer'
StartCombatButton.displayName = 'StartCombatButton'
CombatPanel.displayName = 'CombatPanel'
CombatBar.displayName = 'CombatBar'
ExpandedSection.displayName = 'ExpandedSection'
RoundCounter.displayName = 'RoundCounter'
NavControls.displayName = 'NavControls'
NavButton.displayName = 'NavButton'
NextRoundButton.displayName = 'NextRoundButton'
StatusSection.displayName = 'StatusSection'
EventsButton.displayName = 'EventsButton'
StatusIndicator.displayName = 'StatusIndicator'
ControlButton.displayName = 'ControlButton'
TimelineContainer.displayName = 'TimelineContainer'
RoundButton.displayName = 'RoundButton'
EventIndicator.displayName = 'EventIndicator'
SpeedControl.displayName = 'SpeedControl'
SpeedLabel.displayName = 'SpeedLabel'
SpeedInput.displayName = 'SpeedInput'
SpeedValue.displayName = 'SpeedValue'
StatsGrid.displayName = 'StatsGrid'
StatCard.displayName = 'StatCard'
StatLabel.displayName = 'StatLabel'
StatValue.displayName = 'StatValue'