/**
 * Timeline Container Component
 * Main timeline UI orchestrator
 */

import React from 'react'
import { styled } from '@/foundation/theme'
import { TimelineHeader, EventList } from '../../molecules'
import { useTimeline, useTimelineEvents } from '../../../hooks'

export type TimelineContainerProps = {
  className?: string
}

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: '$gray900',
  borderRadius: '$md',
  border: '1px solid $gray600',
  overflow: 'hidden'
})

const Content = styled('div', {
  display: 'flex',
  flex: 1,
  overflow: 'hidden'
})

const Sidebar = styled('div', {
  width: 300,
  borderRight: '1px solid $gray600',
  background: '$gray850',
  display: 'flex',
  flexDirection: 'column'
})

const MainArea = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
})

const RoundContent = styled('div', {
  flex: 1,
  padding: '$3',
  overflow: 'auto'
})

const RoundInfo = styled('div', {
  padding: '$3',
  borderBottom: '1px solid $gray700',
  background: '$gray800'
})

const RoundTitle = styled('h3', {
  margin: '0 0 $2 0',
  fontSize: '$3',
  fontWeight: 600,
  color: '$gray100'
})

const RoundStats = styled('div', {
  display: 'flex',
  gap: '$4',
  fontSize: '$2',
  color: '$gray400'
})

const Stat = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1'
})

const EmptyState = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$4',
  color: '$gray400',
  textAlign: 'center'
})

const EmptyIcon = styled('div', {
  fontSize: '$8',
  marginBottom: '$3',
  opacity: 0.5
})

const EmptyTitle = styled('h3', {
  margin: '0 0 $2 0',
  fontSize: '$4',
  color: '$gray300'
})

const EmptyText = styled('p', {
  margin: 0,
  fontSize: '$2',
  color: '$gray500',
  maxWidth: 300
})

const CreateButton = styled('button', {
  marginTop: '$4',
  padding: '$3 $4',
  borderRadius: '$md',
  border: 'none',
  background: '$dndRed',
  color: 'white',
  fontSize: '$2',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: '$dndRedDark',
    transform: 'translateY(-1px)'
  }
})

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
    const timelineId = timeline.createTimeline({ mapId: 'current-map', name })
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
      <Container className={className}>
        <EmptyState>
          <EmptyIcon>⏱️</EmptyIcon>
          <EmptyTitle>No Timeline Selected</EmptyTitle>
          <EmptyText>
            Create a timeline to start managing combat rounds and events.
          </EmptyText>
          <CreateButton onClick={handleCreateTimeline}>
            Create Timeline
          </CreateButton>
        </EmptyState>
      </Container>
    )
  }

  const stats = timeline.stats
  const roundStats = {
    events: currentEvents.length,
    executed: currentEvents.filter(e => e.isExecuted).length,
    duration: currentEvents.reduce((sum, e) => sum + e.duration, 0)
  }

  return (
    <Container className={className}>
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

      <Content>
        <Sidebar>
          <RoundInfo>
            <RoundTitle>
              Round {timeline.activeTimeline.currentRound}
            </RoundTitle>
            <RoundStats>
              <Stat>
                📝 {roundStats.events} events
              </Stat>
              <Stat>
                ✅ {roundStats.executed} done
              </Stat>
              <Stat>
                ⏱️ {Math.round(roundStats.duration / 1000)}s
              </Stat>
            </RoundStats>
          </RoundInfo>

          {/* TODO: Round list for navigation */}
          <div style={{ padding: 16, color: '#666' }}>
            <div>Total Rounds: {stats.totalRounds}</div>
            <div>Total Events: {stats.totalEvents}</div>
            <div>Completed: {stats.executedEvents}</div>
          </div>
        </Sidebar>

        <MainArea>
          <RoundContent>
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
          </RoundContent>
        </MainArea>
      </Content>
    </Container>
  )
}