import { useState, type FC, type ChangeEvent } from 'react'
import { Play, Pause, SkipForward, SkipBack, Clock, Zap, Eye, EyeOff, Move } from '@/utils/optimizedIcons'
import useTimelineStore from '@/store/timelineStore'
import useMapStore from '@/store/mapStore'
import type { EventType } from '@/types/timeline'
import * as styles from './Timeline.css'
import { clsx } from 'clsx'

type TimelineProps = {
  onAddEvent?: (type: EventType) => void
  onEditEvents?: () => void
}

export const Timeline: FC<TimelineProps> = ({ onAddEvent, onEditEvents }) => {
  const [isExpanded] = useState(false)
  // Use specific selectors to prevent unnecessary re-renders
  const timeline = useTimelineStore(state => state.timeline)
  const currentEvent = useTimelineStore(state => state.currentEvent)
  const isInCombat = useTimelineStore(state => state.isInCombat)
  const animationSpeed = useTimelineStore(state => state.animationSpeed)
  const startCombat = useTimelineStore(state => state.startCombat)
  const endCombat = useTimelineStore(state => state.endCombat)
  const nextEvent = useTimelineStore(state => state.nextEvent)
  const previousEvent = useTimelineStore(state => state.previousEvent)
  const goToEvent = useTimelineStore(state => state.goToEvent)
  const setAnimationSpeed = useTimelineStore(state => state.setAnimationSpeed)

  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore(state => state.currentMap)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleStartCombat = () => {
    if (currentMap) {
      startCombat(currentMap.id)
    }
  }

  const handleNextEvent = async () => {
    setIsAnimating(true)
    await nextEvent()
    setIsAnimating(false)
  }

  const currentRoundData = timeline?.rounds.find(r => r.number === 1) // Round 1 for now
  const currentEventData = currentRoundData?.events.find(e => e.number === currentEvent)
  const actionCount = currentEventData?.actions.length || 0

  return (
    <div className={styles.timelineContainer}>
      <div className={clsx(styles.timelinePanel, isExpanded && styles.timelinePanelExpanded)}>
        <div className={styles.timelineContent}>
          {/* Compact Header */}
          <div className={styles.timelineHeader}>
            <div className={styles.roundInfo}>
              {/* Combat Toggle */}
              <button
                onClick={isInCombat ? endCombat : handleStartCombat}
                className={clsx(
                  styles.combatButton,
                  isInCombat ? styles.combatButtonActive : styles.combatButtonInactive
                )}
                disabled={!currentMap}
              >
                {isInCombat ? (
                  <>
                    <Pause className={styles.iconInline} />
                    End Combat
                  </>
                ) : (
                  <>
                    <Play className={styles.iconInline} />
                    Start Combat
                  </>
                )}
              </button>

              {/* Event Display */}
              {isInCombat && (
                <div className={styles.roundDisplay}>
                  <div className={styles.roundDisplayContent}>
                    <Clock className={styles.iconGold} />
                    <span className={styles.roundNumber}>Event {currentEvent}</span>
                    {currentEventData?.name && (
                      <span className={styles.roundName}>"{currentEventData.name}"</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Event Navigation */}
            {isInCombat && (
              <div className={styles.roundControls}>
                <button
                  onClick={previousEvent}
                  disabled={currentEvent <= 1 || isAnimating}
                  className={styles.roundButton}
                  title="Previous Event"
                >
                  <SkipBack className={styles.icon} />
                </button>

                <button
                  onClick={handleNextEvent}
                  disabled={isAnimating}
                  className={styles.nextRoundButton}
                  title="Next Event"
                >
                  {isAnimating ? (
                    <span className={clsx(styles.flex, styles.itemsCenter, styles.gap2)}>
                      <Zap className={clsx(styles.icon, styles.iconAnimated)} />
                      Animating...
                    </span>
                  ) : (
                    <>
                      <SkipForward className={styles.iconInline} />
                      Next Event
                    </>
                  )}
                </button>

                {/* Quick Jump */}
                <input
                  type="number"
                  value={currentEvent}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => goToEvent(parseInt(e.target.value) || 1)}
                  className={styles.roundInput}
                  min="1"
                  disabled={isAnimating}
                />
              </div>
            )}
          </div>

          {/* Event Management Bar */}
          {isInCombat && (
            <div className={styles.eventManagementBar}>
              <div className={styles.eventControls}>
                {/* Event Count */}
                {actionCount > 0 && (
                  <div className={styles.eventIndicator}>
                    {actionCount} event{actionCount !== 1 ? 's' : ''} scheduled
                  </div>
                )}

                {/* Add Event Buttons */}
                <div className={styles.eventButtons}>
                  <button
                    onClick={() => onAddEvent?.('move')}
                    className={styles.eventButton}
                    title="Add Move Event"
                  >
                    <Move className={styles.icon} />
                  </button>
                  <button
                    onClick={() => onAddEvent?.('appear')}
                    className={styles.eventButton}
                    title="Add Appear Event"
                  >
                    <Eye className={styles.icon} />
                  </button>
                  <button
                    onClick={() => onAddEvent?.('disappear')}
                    className={styles.eventButton}
                    title="Add Disappear Event"
                  >
                    <EyeOff className={styles.icon} />
                  </button>
                </div>

                {/* Edit Events */}
                {actionCount > 0 && (
                  <button
                    onClick={onEditEvents}
                    className={styles.editEventsButton}
                  >
                    Edit Events
                  </button>
                )}
              </div>

              {/* Animation Speed */}
              <div className={styles.animationControls}>
                <label className={styles.speedLabel}>Speed:</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={animationSpeed}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAnimationSpeed(parseFloat(e.target.value))}
                  className={styles.speedSlider}
                />
                <span className={styles.speedValue}>{animationSpeed}x</span>
              </div>
            </div>
          )}

          {/* Event Preview (mini timeline) */}
          {isInCombat && timeline && currentRoundData && (
            <div className={styles.eventPreview}>
              <div className={styles.eventPreviewContent}>
                {currentRoundData.events.slice(0, 10).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => goToEvent(event.number)}
                    className={clsx(
                      styles.roundPreviewButton,
                      event.number === currentEvent
                        ? styles.roundPreviewButtonCurrent
                        : event.executed
                        ? styles.roundPreviewButtonExecuted
                        : styles.roundPreviewButtonPending
                    )}
                    disabled={isAnimating}
                  >
                    <div className={styles.roundPreviewNumber}>E{event.number}</div>
                    {event.actions.length > 0 && (
                      <div className={styles.eventIndicators}>
                        {event.actions.slice(0, 3).map((action, i) => (
                          <div
                            key={i}
                            className={clsx(
                              styles.eventDot,
                              action.type === 'move' ? styles.eventDotMove :
                              action.type === 'appear' ? styles.eventDotAppear :
                              action.type === 'disappear' ? styles.eventDotDisappear :
                              styles.eventDotOther
                            )}
                          />
                        ))}
                        {event.actions.length > 3 && (
                          <span className={styles.moreEventsIndicator}>+{event.actions.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}