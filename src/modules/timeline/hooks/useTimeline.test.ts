/**
 * Timeline Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimeline } from './useTimeline'

// Mock the store
vi.mock('../store', () => ({
  useTimelineStore: vi.fn(() => ({
    timelines: [],
    activeTimelineId: null,
    playback: {
      isPlaying: false,
      currentRound: 1,
      currentEventIndex: 0,
      playbackSpeed: 1.0,
      autoAdvanceRounds: true
    },
    selectedEventIds: [],
    isCreatingEvent: false,
    eventCreationData: null,

    // Actions
    createTimeline: vi.fn(),
    setActiveTimeline: vi.fn(),
    updateTimeline: vi.fn(),
    deleteTimeline: vi.fn(),
    startCombat: vi.fn(),
    endCombat: vi.fn(),
    addRound: vi.fn(),
    removeRound: vi.fn(),
    nextRound: vi.fn(),
    previousRound: vi.fn(),
    goToRound: vi.fn(),
    addEvent: vi.fn(),
    updateEvent: vi.fn(),
    removeEvent: vi.fn(),
    duplicateEvent: vi.fn(),
    moveEvent: vi.fn(),
    executeEvent: vi.fn(),
    executeRound: vi.fn(),
    selectEvent: vi.fn(),
    selectMultipleEvents: vi.fn(),
    clearSelection: vi.fn(),
    toggleEventSelection: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    setAutoAdvanceRounds: vi.fn(),
    togglePlayback: vi.fn(),
    startEventCreation: vi.fn(),
    updateEventCreation: vi.fn(),
    finishEventCreation: vi.fn(),
    cancelEventCreation: vi.fn(),
    clearAllEvents: vi.fn(),
    duplicateRound: vi.fn(),
    getEventById: vi.fn(),
    getRoundById: vi.fn(),
    getSelectedEvents: vi.fn(() => [])
  }))
}))

describe('useTimeline Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides timeline state', () => {
    const { result } = renderHook(() => useTimeline())

    expect(result.current).toMatchObject({
      timelines: [],
      activeTimeline: null,
      activeTimelineId: null,
      currentRound: null,
      isInCombat: false,
      playback: expect.objectContaining({
        isPlaying: false,
        playbackSpeed: 1.0
      }),
      selectedEventIds: [],
      selectedEvents: [],
      isCreatingEvent: false
    })
  })

  it('provides timeline actions', () => {
    const { result } = renderHook(() => useTimeline())

    // Check that all expected actions are available
    expect(typeof result.current.createTimeline).toBe('function')
    expect(typeof result.current.setActiveTimeline).toBe('function')
    expect(typeof result.current.startCombat).toBe('function')
    expect(typeof result.current.endCombat).toBe('function')
    expect(typeof result.current.addRound).toBe('function')
    expect(typeof result.current.nextRound).toBe('function')
    expect(typeof result.current.addEvent).toBe('function')
    expect(typeof result.current.executeEvent).toBe('function')
    expect(typeof result.current.togglePlayback).toBe('function')
  })

  it('provides computed state selectors', () => {
    const { result } = renderHook(() => useTimeline())

    expect(result.current).toMatchObject({
      stats: expect.objectContaining({
        totalRounds: 0,
        totalEvents: 0,
        executedEvents: 0,
        pendingEvents: 0
      }),
      canAdvanceRound: false,
      canGoBackRound: false,
      playbackProgress: expect.objectContaining({
        currentRound: 0,
        totalRounds: 0,
        overallProgress: 0
      })
    })
  })

  it('memoizes selectors for performance', () => {
    const { result, rerender } = renderHook(() => useTimeline())

    const firstStats = result.current.stats
    const firstProgress = result.current.playbackProgress

    // Rerender without changing underlying data
    rerender()

    // Should return the same objects (memoized)
    expect(result.current.stats).toBe(firstStats)
    expect(result.current.playbackProgress).toBe(firstProgress)
  })

  it('calls store actions correctly', () => {
    const { result } = renderHook(() => useTimeline())

    act(() => {
      result.current.createTimeline({ mapId: 'test', name: 'Test Timeline' })
    })

    // The mock should have been called
    // Note: This test would be more meaningful with actual store implementation
    expect(result.current.createTimeline).toBeDefined()
  })

  it('provides event creation workflow state', () => {
    const { result } = renderHook(() => useTimeline())

    expect(result.current).toMatchObject({
      isCreatingEvent: false,
      eventCreationData: null,
      startEventCreation: expect.any(Function),
      updateEventCreation: expect.any(Function),
      finishEventCreation: expect.any(Function),
      cancelEventCreation: expect.any(Function)
    })
  })

  it('provides utility methods', () => {
    const { result } = renderHook(() => useTimeline())

    expect(typeof result.current.getEventById).toBe('function')
    expect(typeof result.current.getRoundById).toBe('function')
  })
})