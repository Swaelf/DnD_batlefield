import React, { useState } from 'react'
import { Play, Pause, SkipForward, SkipBack, Clock, Zap, Eye, EyeOff, Move } from 'lucide-react'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import { EventType } from '@/types/timeline'

interface TimelineProps {
  onAddEvent?: (type: EventType) => void
  onEditEvents?: () => void
}

export const Timeline: React.FC<TimelineProps> = ({ onAddEvent, onEditEvents }) => {
  const [isExpanded] = useState(false)
  const {
    timeline,
    currentRound,
    isInCombat,
    animationSpeed,
    startCombat,
    endCombat,
    nextRound,
    previousRound,
    goToRound,
    setAnimationSpeed
  } = useRoundStore()

  const { currentMap } = useMapStore()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleStartCombat = () => {
    if (currentMap) {
      startCombat(currentMap.id)
    }
  }

  const handleNextRound = async () => {
    setIsAnimating(true)
    await nextRound()
    setIsAnimating(false)
  }

  const currentRoundData = timeline?.rounds.find(r => r.number === currentRound)
  const eventCount = currentRoundData?.events.length || 0

  // Calculate position based on expansion state
  const bottomPosition = isExpanded ? 'bottom-4' : 'bottom-4'
  const heightClass = isExpanded ? 'max-h-96' : 'max-h-32'

  return (
    <div className={`absolute ${bottomPosition} left-1/2 -translate-x-1/2 z-20 transition-all duration-300`}>
      <div className={`bg-dnd-black/90 backdrop-blur-sm rounded-lg shadow-xl border border-dnd-gold/20 ${heightClass} transition-all`}>
        <div className="p-3">
          {/* Compact Header */}
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              {/* Combat Toggle */}
              <button
                onClick={isInCombat ? endCombat : handleStartCombat}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  isInCombat
                    ? 'bg-dnd-red text-white hover:bg-red-700'
                    : 'bg-dnd-gray-700 text-gray-300 hover:bg-dnd-gray-600'
                }`}
                disabled={!currentMap}
              >
                {isInCombat ? (
                  <>
                    <Pause className="inline-block w-4 h-4 mr-2" />
                    End Combat
                  </>
                ) : (
                  <>
                    <Play className="inline-block w-4 h-4 mr-2" />
                    Start Combat
                  </>
                )}
              </button>

              {/* Round Display */}
              {isInCombat && (
                <div className="bg-dnd-gray-800 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-dnd-gold" />
                    <span className="text-lg font-bold text-white">Round {currentRound}</span>
                    {currentRoundData?.name && (
                      <span className="text-sm text-gray-400 ml-1">"{currentRoundData.name}"</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Round Navigation */}
            {isInCombat && (
              <div className="flex items-center gap-2">
                <button
                  onClick={previousRound}
                  disabled={currentRound <= 1 || isAnimating}
                  className="p-2 bg-dnd-gray-700 text-gray-300 rounded hover:bg-dnd-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Previous Round"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={handleNextRound}
                  disabled={isAnimating}
                  className="px-4 py-2 bg-dnd-gold text-dnd-black rounded font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Next Round"
                >
                  {isAnimating ? (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 animate-pulse" />
                      Animating...
                    </span>
                  ) : (
                    <>
                      <SkipForward className="inline-block w-4 h-4 mr-1" />
                      Next Round
                    </>
                  )}
                </button>

                {/* Quick Jump */}
                <input
                  type="number"
                  value={currentRound}
                  onChange={(e) => goToRound(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 bg-dnd-gray-700 text-white rounded text-center"
                  min="1"
                  disabled={isAnimating}
                />
              </div>
            )}
          </div>

          {/* Event Management Bar */}
          {isInCombat && (
            <div className="flex items-center justify-between border-t border-dnd-gray-700 pt-3">
              <div className="flex items-center gap-2">
                {/* Event Count */}
                {eventCount > 0 && (
                  <div className="px-3 py-1 bg-dnd-gray-700 rounded text-sm text-gray-300">
                    {eventCount} event{eventCount !== 1 ? 's' : ''} scheduled
                  </div>
                )}

                {/* Add Event Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAddEvent?.('move')}
                    className="p-2 bg-dnd-gray-700 text-gray-300 rounded hover:bg-dnd-gray-600 transition-all"
                    title="Add Move Event"
                  >
                    <Move className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onAddEvent?.('appear')}
                    className="p-2 bg-dnd-gray-700 text-gray-300 rounded hover:bg-dnd-gray-600 transition-all"
                    title="Add Appear Event"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onAddEvent?.('disappear')}
                    className="p-2 bg-dnd-gray-700 text-gray-300 rounded hover:bg-dnd-gray-600 transition-all"
                    title="Add Disappear Event"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>

                {/* Edit Events */}
                {eventCount > 0 && (
                  <button
                    onClick={onEditEvents}
                    className="px-3 py-1 bg-dnd-gray-700 text-gray-300 rounded hover:bg-dnd-gray-600 transition-all text-sm"
                  >
                    Edit Events
                  </button>
                )}
              </div>

              {/* Animation Speed */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Speed:</label>
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
          )}

          {/* Event Preview (mini timeline) */}
          {isInCombat && timeline && (
            <div className="mt-3 border-t border-dnd-gray-700 pt-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {timeline.rounds.slice(0, 10).map((round) => (
                  <button
                    key={round.id}
                    onClick={() => goToRound(round.number)}
                    className={`min-w-[60px] px-3 py-2 rounded text-sm font-medium transition-all ${
                      round.number === currentRound
                        ? 'bg-dnd-gold text-dnd-black'
                        : round.executed
                        ? 'bg-dnd-gray-700 text-gray-400'
                        : 'bg-dnd-gray-800 text-gray-300 hover:bg-dnd-gray-700'
                    }`}
                    disabled={isAnimating}
                  >
                    <div className="text-xs">R{round.number}</div>
                    {round.events.length > 0 && (
                      <div className="flex justify-center gap-1 mt-1">
                        {round.events.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              event.type === 'move' ? 'bg-blue-400' :
                              event.type === 'appear' ? 'bg-green-400' :
                              'bg-red-400'
                            }`}
                          />
                        ))}
                        {round.events.length > 3 && (
                          <span className="text-xs">+{round.events.length - 3}</span>
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