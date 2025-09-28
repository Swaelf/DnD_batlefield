/**
 * Timeline Container Component
 * Main timeline UI orchestrator
 */

import React from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { TimelineHeader, EventList } from '../../molecules'
import { useTimeline, useTimelineEvents } from '../../../hooks'

export type TimelineContainerProps = {
  className?: string
}


/**
 * Main timeline container component
 */
export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  className
}) => {
  const timeline = useTimeline()
  const timelineEvents = useTimelineEvents()

  const currentRound = timeline.currentRound
  const currentEvents = currentRound?.events || []

  // Event handlers
  const handleCreateTimeline = () => {
    const name = `Timeline ${timeline.timelines.length + 1}`
    timeline.createTimeline({ mapId: 'current-map', name })
    // Add a default round
    timeline.addRound()
  }

  const handleEventSelect = (event: any) => {
    timeline.selectEvent(event.id)
  }

  const handleEventEdit = (event: any) => {
    // TODO: Open event editor
    console.log('Edit event:', event)
  }

  const handleEventDelete = (event: any) => {
    if (confirm('Are you sure you want to delete this event?')) {
      timeline.removeEvent(event.id)
    }
  }

  const handleEventExecute = async (event: any) => {
    try {
      await timeline.executeEvent(event.id)
      timelineEvents.emitEventExecuted(timeline.activeTimelineId!, event.id, true)
    } catch (error) {
      console.error('Failed to execute event:', error)
      timelineEvents.emitEventExecuted(timeline.activeTimelineId!, event.id, false)
    }
  }

  // Show empty state if no timeline
  if (!timeline.activeTimeline) {
    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '6px',
          border: '1px solid var(--colors-gray600)',
          overflow: 'hidden'
        }}
      >
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            color: 'var(--colors-gray400)',
            textAlign: 'center'
          }}
        >
          <Box
            style={{
              fontSize: '48px',
              marginBottom: '12px',
              opacity: 0.5
            }}
          >
            ⏱️
          </Box>
          <Text
            variant="heading"
            size="lg"
            style={{
              margin: '0 0 8px 0',
              color: 'var(--colors-gray300)'
            }}
          >
            No Timeline Selected
          </Text>
          <Text
            variant="body"
            size="sm"
            style={{
              margin: 0,
              color: 'var(--colors-gray500)',
              maxWidth: '300px'
            }}
          >
            Create a timeline to start managing combat rounds and events.
          </Text>
          <Button
            variant="primary"
            size="md"
            onClick={handleCreateTimeline}
            style={{
              marginTop: '16px',
              backgroundColor: 'var(--colors-dndRed)',
              color: 'white'
            }}
          >
            Create Timeline
          </Button>
        </Box>
      </Box>
    )
  }

  const stats = timeline.stats
  const roundStats = {
    events: currentEvents.length,
    executed: currentEvents.filter(e => e.isExecuted).length,
    duration: currentEvents.reduce((sum, e) => sum + e.duration, 0)
  }

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--colors-gray900)',
        borderRadius: '6px',
        border: '1px solid var(--colors-gray600)',
        overflow: 'hidden'
      }}
    >
      {/* Timeline Header */}
      <TimelineHeader
        timeline={timeline.activeTimeline}
        playback={timeline.playback}
        onStartCombat={timeline.startCombat}
        onEndCombat={timeline.endCombat}
        onTogglePlayback={timeline.togglePlayback}
        onPreviousRound={timeline.previousRound}
        onNextRound={timeline.nextRound}
        onGoToRound={timeline.goToRound}
        onSetPlaybackSpeed={timeline.setPlaybackSpeed}
      />

      {/* Content Area */}
      <Box
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {/* Sidebar */}
        <Box
          style={{
            width: '300px',
            borderRight: '1px solid var(--colors-gray600)',
            backgroundColor: 'var(--colors-gray850)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Round Info */}
          <Box
            style={{
              padding: '12px',
              borderBottom: '1px solid var(--colors-gray700)',
              backgroundColor: 'var(--colors-gray800)'
            }}
          >
            <Text
              variant="heading"
              size="md"
              style={{
                margin: '0 0 8px 0',
                fontWeight: '600',
                color: 'var(--colors-gray100)'
              }}
            >
              Round {timeline.activeTimeline.currentRound}
            </Text>
            <Box
              style={{
                display: 'flex',
                gap: '16px',
                fontSize: '14px',
                color: 'var(--colors-gray400)'
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📝 {roundStats.events} events
              </Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ✅ {roundStats.executed} done
              </Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ⏱️ {Math.round(roundStats.duration / 1000)}s
              </Box>
            </Box>
          </Box>

          {/* Round Navigation */}
          <Box
            style={{
              padding: '16px',
              color: '#666'
            }}
          >
            <Text
              variant="body"
              size="sm"
              style={{
                display: 'block',
                marginBottom: '4px',
                color: 'var(--colors-gray400)'
              }}
            >
              Total Rounds: {stats.totalRounds}
            </Text>
            <Text
              variant="body"
              size="sm"
              style={{
                display: 'block',
                marginBottom: '4px',
                color: 'var(--colors-gray400)'
              }}
            >
              Total Events: {stats.totalEvents}
            </Text>
            <Text
              variant="body"
              size="sm"
              style={{
                display: 'block',
                color: 'var(--colors-gray400)'
              }}
            >
              Completed: {stats.executedEvents}
            </Text>
          </Box>
        </Box>

        {/* Main Area */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Round Content */}
          <Box
            style={{
              flex: 1,
              padding: '12px',
              overflow: 'auto'
            }}
          >
            <EventList
              events={currentEvents}
              selectedEventIds={timeline.selectedEventIds}
              executingEventId={null} // TODO: Track executing event
              onEventSelect={handleEventSelect}
              onEventEdit={handleEventEdit}
              onEventDelete={handleEventDelete}
              onEventExecute={handleEventExecute}
              emptyMessage="No events in this round. Add events to get started."
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}