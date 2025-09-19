import React, { useState } from 'react'
import { Pause, SkipForward, ChevronUp, ChevronDown, Sparkles, Shield, Clock, Calendar } from 'lucide-react'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import { EventEditor } from './EventEditor'

export const CombatTracker: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showEventEditor, setShowEventEditor] = useState(false)
  const {
    timeline,
    currentRound,
    isInCombat,
    animationSpeed,
    startCombat,
    endCombat,
    nextRound,
    previousRound,
    setAnimationSpeed
  } = useRoundStore()

  const { currentMap, cleanupExpiredSpells } = useMapStore()

  const handleStartCombat = () => {
    if (currentMap) {
      startCombat(currentMap.id)
    }
  }

  const handleNextRound = async () => {
    await nextRound()
    // Clean up expired spells after round change
    cleanupExpiredSpells(currentRound + 1)
  }

  const currentRoundData = timeline?.rounds.find(r => r.number === currentRound)
  const eventCount = currentRoundData?.events.length || 0

  // Count active spell effects
  const activeSpells = currentMap?.objects.filter(obj => obj.isSpellEffect).length || 0

  if (!isInCombat) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={handleStartCombat}
          className="px-6 py-3 bg-dnd-red text-white font-bold rounded-lg hover:bg-red-700 transition-all shadow-lg flex items-center gap-2"
          disabled={!currentMap}
        >
          <Shield className="w-5 h-5" />
          Start Combat
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-dnd-black/95 backdrop-blur-sm rounded-lg shadow-2xl border border-dnd-gold/30">
        {/* Main Combat Bar */}
        <div className="flex items-center gap-3 p-3">
          {/* Round Counter */}
          <div className="bg-dnd-gray-800 rounded px-4 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-dnd-gold" />
            <span className="text-xl font-bold text-white">Round {currentRound}</span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={previousRound}
              disabled={currentRound <= 1}
              className="p-2 bg-dnd-gray-700 text-gray-300 rounded hover:bg-dnd-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Round (←)"
            >
              <SkipForward className="w-4 h-4 rotate-180" />
            </button>

            <button
              onClick={handleNextRound}
              className="px-6 py-2 bg-dnd-gold text-dnd-black rounded font-bold hover:bg-yellow-500 transition-all flex items-center gap-2"
              title="Next Round (Space)"
            >
              <SkipForward className="w-4 h-4" />
              Next Round
            </button>
          </div>

          {/* Status Indicators and Event Button */}
          <div className="flex items-center gap-2 px-3 border-l border-dnd-gray-700">
            <button
              onClick={() => setShowEventEditor(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all text-sm"
              title="Manage Events"
            >
              <Calendar className="w-3 h-3" />
              <span>Events</span>
            </button>

            {eventCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 rounded text-sm">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400">{eventCount}</span>
              </div>
            )}
            {activeSpells > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 rounded text-sm">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-purple-400">{activeSpells}</span>
              </div>
            )}
          </div>

          {/* End Combat */}
          <button
            onClick={endCombat}
            className="p-2 bg-dnd-gray-700 text-gray-300 rounded hover:bg-red-600 hover:text-white transition-all"
            title="End Combat"
          >
            <Pause className="w-4 h-4" />
          </button>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-dnd-gray-700 text-gray-300 rounded hover:bg-dnd-gray-600 transition-all"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Section */}
        {isExpanded && (
          <div className="border-t border-dnd-gray-700 p-3">
            {/* Speed Control */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Animation Speed:</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-gray-300 w-10">{animationSpeed}x</span>
              </div>
            </div>

            {/* Round Timeline */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {Array.from({ length: Math.max(10, currentRound + 2) }, (_, i) => i + 1).map((roundNum) => {
                const round = timeline?.rounds.find(r => r.number === roundNum)
                const hasEvents = round && round.events.length > 0
                const isExecuted = round?.executed

                return (
                  <button
                    key={roundNum}
                    className={`min-w-[40px] px-2 py-1 rounded text-sm font-medium transition-all ${
                      roundNum === currentRound
                        ? 'bg-dnd-gold text-dnd-black'
                        : isExecuted
                        ? 'bg-dnd-gray-700 text-gray-500'
                        : 'bg-dnd-gray-800 text-gray-300 hover:bg-dnd-gray-700'
                    }`}
                    onClick={() => {/* goToRound(roundNum) */}}
                  >
                    <div>{roundNum}</div>
                    {hasEvents && (
                      <div className="h-1 w-full bg-blue-400 mt-1 rounded" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div className="bg-dnd-gray-800 rounded p-2 text-center">
                <div className="text-gray-400">Total Rounds</div>
                <div className="text-white font-bold">{currentRound}</div>
              </div>
              <div className="bg-dnd-gray-800 rounded p-2 text-center">
                <div className="text-gray-400">Events</div>
                <div className="text-white font-bold">{timeline?.rounds.reduce((sum, r) => sum + r.events.length, 0) || 0}</div>
              </div>
              <div className="bg-dnd-gray-800 rounded p-2 text-center">
                <div className="text-gray-400">Active Spells</div>
                <div className="text-white font-bold">{activeSpells}</div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Event Editor Dialog - Moved outside of positioned container */}
      <EventEditor
        isOpen={showEventEditor}
        onClose={() => setShowEventEditor(false)}
      />
    </>
  )
}