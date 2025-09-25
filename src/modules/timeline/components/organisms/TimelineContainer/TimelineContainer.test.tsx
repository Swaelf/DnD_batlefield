/**
 * Timeline Container Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TimelineContainer } from './TimelineContainer'

// Mock the hooks
vi.mock('../../../hooks/useTimeline', () => ({
  useTimeline: vi.fn(() => ({
    timelines: [],
    activeTimeline: null,
    activeTimelineId: null,
    currentRound: null,
    isInCombat: false,
    stats: {
      totalRounds: 0,
      totalEvents: 0,
      executedEvents: 0,
      pendingEvents: 0,
      totalDuration: 0,
      averageEventsPerRound: 0
    },
    playback: {
      isPlaying: false,
      currentRound: 1,
      currentEventIndex: 0,
      playbackSpeed: 1.0,
      autoAdvanceRounds: true
    },
    selectedEventIds: [],
    selectedEvents: [],
    isCreatingEvent: false,
    eventCreationData: null,
    createTimeline: vi.fn(),
    setActiveTimeline: vi.fn(),
    startCombat: vi.fn(),
    endCombat: vi.fn(),
    togglePlayback: vi.fn(),
    previousRound: vi.fn(),
    nextRound: vi.fn(),
    goToRound: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    addRound: vi.fn(),
    selectEvent: vi.fn(),
    removeEvent: vi.fn(),
    executeEvent: vi.fn()
  }))
}))

vi.mock('../../../hooks/useTimelineEvents', () => ({
  useTimelineEvents: vi.fn(() => ({
    emitEventExecuted: vi.fn()
  }))
}))

describe('TimelineContainer Component', () => {
  it('shows empty state when no timeline selected', () => {
    render(<TimelineContainer />)

    expect(screen.getByText('No Timeline Selected')).toBeInTheDocument()
    expect(screen.getByText('Create a timeline to start managing combat rounds and events.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Timeline' })).toBeInTheDocument()
  })

  it('renders timeline header when timeline is active', () => {
    const mockTimeline = {
      id: 'timeline-1',
      name: 'Test Timeline',
      currentRound: 2,
      rounds: [
        { id: 'round-1', roundNumber: 1, events: [] },
        { id: 'round-2', roundNumber: 2, events: [] }
      ],
      isActive: true
    }

    // Mock the hook to return active timeline
    vi.mocked(require('../../../hooks/useTimeline').useTimeline).mockReturnValue({
      timelines: [mockTimeline],
      activeTimeline: mockTimeline,
      activeTimelineId: 'timeline-1',
      currentRound: mockTimeline.rounds[1],
      isInCombat: true,
      stats: {
        totalRounds: 2,
        totalEvents: 0,
        executedEvents: 0,
        pendingEvents: 0,
        totalDuration: 0,
        averageEventsPerRound: 0
      },
      playback: {
        isPlaying: false,
        currentRound: 2,
        currentEventIndex: 0,
        playbackSpeed: 1.0,
        autoAdvanceRounds: true
      },
      selectedEventIds: [],
      selectedEvents: [],
      isCreatingEvent: false,
      eventCreationData: null,
      createTimeline: vi.fn(),
      setActiveTimeline: vi.fn(),
      startCombat: vi.fn(),
      endCombat: vi.fn(),
      togglePlayback: vi.fn(),
      previousRound: vi.fn(),
      nextRound: vi.fn(),
      goToRound: vi.fn(),
      setPlaybackSpeed: vi.fn(),
      addRound: vi.fn(),
      selectEvent: vi.fn(),
      removeEvent: vi.fn(),
      executeEvent: vi.fn()
    })

    render(<TimelineContainer />)

    // Should show timeline header with timeline name
    expect(screen.getByText('Test Timeline')).toBeInTheDocument()

    // Should show round info
    expect(screen.getByText('Round 2')).toBeInTheDocument()
    expect(screen.getByText('0 events')).toBeInTheDocument()
  })

  it('displays round statistics', () => {
    const mockTimeline = {
      id: 'timeline-1',
      name: 'Test Timeline',
      currentRound: 1,
      rounds: [
        {
          id: 'round-1',
          roundNumber: 1,
          events: [
            { id: 'event-1', isExecuted: false, duration: 2000 },
            { id: 'event-2', isExecuted: true, duration: 1500 }
          ]
        }
      ],
      isActive: true
    }

    vi.mocked(require('../../../hooks/useTimeline').useTimeline).mockReturnValue({
      timelines: [mockTimeline],
      activeTimeline: mockTimeline,
      activeTimelineId: 'timeline-1',
      currentRound: mockTimeline.rounds[0],
      isInCombat: true,
      stats: {
        totalRounds: 1,
        totalEvents: 2,
        executedEvents: 1,
        pendingEvents: 1,
        totalDuration: 3500,
        averageEventsPerRound: 2
      },
      playback: {
        isPlaying: false,
        currentRound: 1,
        currentEventIndex: 0,
        playbackSpeed: 1.0,
        autoAdvanceRounds: true
      },
      selectedEventIds: [],
      selectedEvents: [],
      isCreatingEvent: false,
      eventCreationData: null,
      createTimeline: vi.fn(),
      setActiveTimeline: vi.fn(),
      startCombat: vi.fn(),
      endCombat: vi.fn(),
      togglePlayback: vi.fn(),
      previousRound: vi.fn(),
      nextRound: vi.fn(),
      goToRound: vi.fn(),
      setPlaybackSpeed: vi.fn(),
      addRound: vi.fn(),
      selectEvent: vi.fn(),
      removeEvent: vi.fn(),
      executeEvent: vi.fn()
    })

    render(<TimelineContainer />)

    // Should show round statistics
    expect(screen.getByText('2 events')).toBeInTheDocument()
    expect(screen.getByText('1 done')).toBeInTheDocument()
    expect(screen.getByText('4s')).toBeInTheDocument() // 3500ms rounded

    // Should show total statistics
    expect(screen.getByText('Total Rounds: 1')).toBeInTheDocument()
    expect(screen.getByText('Total Events: 2')).toBeInTheDocument()
    expect(screen.getByText('Completed: 1')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<TimelineContainer className="custom-timeline" />)
    expect(container.firstChild).toHaveClass('custom-timeline')
  })

  it('shows event list for current round', () => {
    const mockTimeline = {
      id: 'timeline-1',
      name: 'Test Timeline',
      currentRound: 1,
      rounds: [
        {
          id: 'round-1',
          roundNumber: 1,
          events: []
        }
      ],
      isActive: false
    }

    vi.mocked(require('../../../hooks/useTimeline').useTimeline).mockReturnValue({
      timelines: [mockTimeline],
      activeTimeline: mockTimeline,
      activeTimelineId: 'timeline-1',
      currentRound: mockTimeline.rounds[0],
      isInCombat: false,
      stats: {
        totalRounds: 1,
        totalEvents: 0,
        executedEvents: 0,
        pendingEvents: 0,
        totalDuration: 0,
        averageEventsPerRound: 0
      },
      playback: {
        isPlaying: false,
        currentRound: 1,
        currentEventIndex: 0,
        playbackSpeed: 1.0,
        autoAdvanceRounds: true
      },
      selectedEventIds: [],
      selectedEvents: [],
      isCreatingEvent: false,
      eventCreationData: null,
      createTimeline: vi.fn(),
      setActiveTimeline: vi.fn(),
      startCombat: vi.fn(),
      endCombat: vi.fn(),
      togglePlayback: vi.fn(),
      previousRound: vi.fn(),
      nextRound: vi.fn(),
      goToRound: vi.fn(),
      setPlaybackSpeed: vi.fn(),
      addRound: vi.fn(),
      selectEvent: vi.fn(),
      removeEvent: vi.fn(),
      executeEvent: vi.fn()
    })

    render(<TimelineContainer />)

    // Should show empty message for event list
    expect(screen.getByText('No events in this round. Add events to get started.')).toBeInTheDocument()
  })
})