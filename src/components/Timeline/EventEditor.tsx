import React, { useState, useEffect } from 'react'
import { X, Move, Eye, EyeOff, Plus, Trash2, MapPin, MousePointer, Zap } from 'lucide-react'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import useEventCreationStore from '@/store/eventCreationStore'
import { EventType, MoveEventData, AppearEventData, DisappearEventData, SpellEventData, SpellCategory } from '@/types/timeline'
import { Token } from '@/types/token'
import { Position } from '@/types/map'

interface EventEditorProps {
  isOpen: boolean
  onClose: () => void
  initialEventType?: EventType
  tokenId?: string
  roundNumber?: number
}

export const EventEditor: React.FC<EventEditorProps> = ({
  isOpen,
  onClose,
  initialEventType = 'move',
  tokenId: initialTokenId
}) => {
  const { currentRound, timeline, addEvent, removeEvent } = useRoundStore()
  const { currentMap } = useMapStore()

  const [selectedToken, setSelectedToken] = useState<string>(initialTokenId || '')
  const [eventType, setEventType] = useState<EventType>(initialEventType)
  const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, y: 0 })
  const [fadeEffect, setFadeEffect] = useState(true)
  const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(false)

  // Spell-related state
  const [useEnvironmentCaster, setUseEnvironmentCaster] = useState(false)
  const [spellName, setSpellName] = useState('')
  const [spellCategory, setSpellCategory] = useState<SpellCategory>('projectile-burst')
  const [spellColor, setSpellColor] = useState('#ff4500')
  const [spellSize, setSpellSize] = useState(20) // For area effects and burst radius
  const [spellRange, setSpellRange] = useState(120) // For projectiles and rays (in feet)
  const [spellDuration, setSpellDuration] = useState(3) // Rounds for area effects

  // Spell presets
  const spellPresets = {
    fireball: { name: 'Fireball', category: 'projectile-burst' as SpellCategory, color: '#ff4500', size: 20, range: 150, duration: 0 },
    magicMissile: { name: 'Magic Missile', category: 'projectile' as SpellCategory, color: '#9370db', range: 120, duration: 0 },
    rayOfFrost: { name: 'Ray of Frost', category: 'ray' as SpellCategory, color: '#00bfff', range: 60, duration: 0 },
    web: { name: 'Web', category: 'area' as SpellCategory, color: '#f5f5dc', size: 20, duration: 10 },
    thunderwave: { name: 'Thunderwave', category: 'burst' as SpellCategory, color: '#4169e1', size: 15, duration: 0 },
    entangle: { name: 'Entangle', category: 'area' as SpellCategory, color: '#228b22', size: 20, duration: 10 },
    grease: { name: 'Grease', category: 'area' as SpellCategory, color: '#708090', size: 10, duration: 10 }
  }

  // Fixed values - no longer user-editable
  const duration = 1000 // Fixed 1 second duration
  const targetRound = currentRound + 1 // Always schedule for next round

  const {
    isPicking,
    startPickingPosition,
    startPickingToken,
    toPosition: pickedToPosition,
    selectedTokenId: pickedTokenId
  } = useEventCreationStore()

  // Get all tokens from the current map (excluding void token)
  const tokens = (currentMap?.objects.filter(obj =>
    obj.type === 'token' && obj.id !== 'void-token'
  ) as Token[]) || []

  // Get events for the next round
  const nextRound = currentRound + 1
  const roundEvents = timeline?.rounds.find(r => r.number === nextRound)?.events || []

  useEffect(() => {
    // Set default target position based on selected token
    if (selectedToken && currentMap) {
      const token = currentMap.objects.find(obj => obj.id === selectedToken)
      if (token) {
        // Set default target position slightly offset from current position
        setTargetPosition({ x: token.position.x + 100, y: token.position.y })
      }
    }
  }, [selectedToken, currentMap])

  // Update target position when picked from map
  useEffect(() => {
    if (pickedToPosition && isPicking === null && isTemporarilyHidden) {
      setTargetPosition(pickedToPosition)
      // Restore the dialog after position is picked
      setIsTemporarilyHidden(false)
    }
  }, [pickedToPosition, isPicking, isTemporarilyHidden])

  // Update selected token when picked from map
  useEffect(() => {
    if (pickedTokenId && isPicking === null && isTemporarilyHidden) {
      setSelectedToken(pickedTokenId)
      // Restore the dialog after token is picked
      setIsTemporarilyHidden(false)
    }
  }, [pickedTokenId, isPicking, isTemporarilyHidden])

  const handleAddEvent = () => {
    // Special handling for spell events
    if (eventType === 'spell') {
      const casterId = useEnvironmentCaster ? 'void-token' : selectedToken
      if (!casterId || !currentMap) return

      const caster = currentMap.objects.find(obj => obj.id === casterId)
      if (!caster) return

      const eventData: SpellEventData = {
        type: 'spell',
        spellName,
        category: spellCategory,
        fromPosition: caster.position,
        toPosition: targetPosition,
        color: spellColor,
        size: spellSize,
        range: (spellCategory === 'projectile' || spellCategory === 'projectile-burst' || spellCategory === 'ray') ? spellRange : undefined,
        duration: spellCategory === 'ray' ? 800 : 1500, // Shorter for rays
        projectileSpeed: 500,
        burstRadius: spellCategory === 'projectile-burst' || spellCategory === 'burst' ? spellSize * 2 : undefined,
        persistDuration: spellCategory === 'area' ? spellDuration : undefined, // Area effects persist
        particleEffect: true
      }

      addEvent(casterId, 'spell', eventData, targetRound)

      // Reset form
      setSpellName('')
      setTargetPosition({ x: 0, y: 0 })
      setSpellRange(120) // Reset to default
      setSpellDuration(3) // Reset to default
      return
    }

    // Original code for non-spell events
    if (!selectedToken || !currentMap) return

    // Get current token position
    const token = currentMap.objects.find(obj => obj.id === selectedToken)
    if (!token) return

    const currentPosition = token.position
    let eventData: MoveEventData | AppearEventData | DisappearEventData

    switch (eventType) {
      case 'move':
        eventData = {
          type: 'move',
          fromPosition: currentPosition, // Always use current position
          toPosition: targetPosition,
          duration,
          easing: 'ease-in-out'
        }
        break
      case 'appear':
        eventData = {
          type: 'appear',
          position: targetPosition, // Use target position for appear
          fadeIn: fadeEffect,
          duration
        }
        break
      case 'disappear':
        eventData = {
          type: 'disappear',
          fadeOut: fadeEffect,
          duration
        }
        break
      default:
        return
    }

    addEvent(selectedToken, eventType, eventData, targetRound)

    // Reset form
    setSelectedToken('')
    setTargetPosition({ x: 0, y: 0 })
  }

  const handleDeleteEvent = (eventId: string) => {
    removeEvent(eventId)
  }

  const handlePositionPick = () => {
    // Hide the dialog temporarily while picking
    setIsTemporarilyHidden(true)
    startPickingPosition('to')
    // The MapCanvas will handle the click and update the position
  }

  const handleTokenPick = () => {
    // Hide the dialog temporarily while picking
    setIsTemporarilyHidden(true)
    startPickingToken()
    // The MapCanvas/ObjectsLayer will handle the click and update the selected token
  }

  if (!isOpen) return null

  // Don't render dialog when temporarily hidden for position picking
  if (isTemporarilyHidden) return null

  return (
    <>
      {/* Backdrop - increased z-index to ensure it's above everything */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
      />

      {/* Dialog - center of viewport with high z-index and responsive width */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90vw] max-w-[1100px] max-h-[85vh] overflow-hidden">
        <div className="bg-dnd-gray-900 rounded-lg shadow-2xl border border-dnd-gold/20 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dnd-gray-700">
            <h2 className="text-xl font-bold text-white">Event Editor</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-dnd-gray-700 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content - Three Column Layout when spell is selected */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Spell Details (conditional) */}
            {eventType === 'spell' && (
              <div className="w-64 p-4 border-r border-dnd-gray-700 bg-dnd-gray-800/50 overflow-y-auto">
                <h4 className="text-sm font-bold text-dnd-gold mb-3">Spell Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Spell Name</label>
                    <input
                      type="text"
                      value={spellName}
                      onChange={(e) => setSpellName(e.target.value)}
                      placeholder="Enter spell name..."
                      className="w-full px-2 py-1 text-sm bg-dnd-gray-700 text-white rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Presets</label>
                    <select
                      onChange={(e) => {
                        const preset = spellPresets[e.target.value as keyof typeof spellPresets]
                        if (preset) {
                          setSpellName(preset.name)
                          setSpellCategory(preset.category)
                          setSpellColor(preset.color)
                          if ('size' in preset) setSpellSize(preset.size)
                          if ('range' in preset) setSpellRange(preset.range)
                          setSpellDuration(preset.duration)
                        }
                      }}
                      className="w-full px-2 py-1 text-sm bg-dnd-gray-700 text-white rounded"
                    >
                      <option value="">Choose preset...</option>
                      {Object.keys(spellPresets).map(key => (
                        <option key={key} value={key}>
                          {spellPresets[key as keyof typeof spellPresets].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Animation Type</label>
                    <select
                      value={spellCategory}
                      onChange={(e) => setSpellCategory(e.target.value as SpellCategory)}
                      className="w-full px-2 py-1 text-sm bg-dnd-gray-700 text-white rounded"
                    >
                      <option value="projectile-burst">Projectile + Burst</option>
                      <option value="projectile">Projectile</option>
                      <option value="ray">Ray/Beam</option>
                      <option value="area">Area Effect</option>
                      <option value="burst">Burst/Explosion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Spell Color</label>
                    <input
                      type="color"
                      value={spellColor}
                      onChange={(e) => setSpellColor(e.target.value)}
                      className="w-full h-8 bg-dnd-gray-700 rounded cursor-pointer"
                    />
                  </div>

                  {/* Range field for projectiles and rays */}
                  {(spellCategory === 'projectile' || spellCategory === 'projectile-burst' || spellCategory === 'ray') && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Range (ft)</label>
                      <input
                        type="number"
                        min="1"
                        value={spellRange}
                        onChange={(e) => setSpellRange(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2 py-1 text-sm bg-dnd-gray-700 text-white rounded"
                        placeholder="Enter range in feet..."
                      />
                    </div>
                  )}

                  {/* Size field for area effects and bursts */}
                  {(spellCategory === 'area' || spellCategory === 'burst' || spellCategory === 'projectile-burst') && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        {spellCategory === 'projectile-burst' ? 'Burst Size (ft)' : 'Effect Size (ft)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={spellSize}
                        onChange={(e) => setSpellSize(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2 py-1 text-sm bg-dnd-gray-700 text-white rounded"
                        placeholder={spellCategory === 'projectile-burst' ? 'Enter burst size...' : 'Enter size in feet...'}
                      />
                    </div>
                  )}

                  {/* Duration field for area effects */}
                  {spellCategory === 'area' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Duration (rounds)</label>
                      <input
                        type="number"
                        min="1"
                        value={spellDuration}
                        onChange={(e) => setSpellDuration(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2 py-1 text-sm bg-dnd-gray-700 text-white rounded"
                        placeholder="Enter duration in rounds..."
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Area effects persist for multiple rounds
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-dnd-gray-600">
                    <label className="flex items-center gap-2 text-xs text-gray-300">
                      <input
                        type="checkbox"
                        checked={useEnvironmentCaster}
                        onChange={(e) => setUseEnvironmentCaster(e.target.checked)}
                        className="rounded text-dnd-gold"
                      />
                      Environment Caster (DM)
                    </label>
                    {!useEnvironmentCaster && (
                      <div className="text-xs text-gray-500 mt-1">
                        Caster: {tokens.find(t => t.id === selectedToken)?.name || 'Select token'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Center Column - Add New Event */}
            <div className="flex-1 p-4 overflow-y-auto border-r border-dnd-gray-700">
              <div className="p-4 bg-dnd-gray-800 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Add New Event</h3>

              <div className="space-y-4">
                {/* Token Selection */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Token</label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleTokenPick}
                      className={`px-3 py-2 rounded font-medium transition-all ${
                        isPicking === 'token'
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-dnd-gold text-dnd-black hover:bg-yellow-500'
                      }`}
                      title="Click on a token on the map"
                    >
                      <MousePointer className="w-4 h-4" />
                    </button>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="flex-1 px-3 py-2 bg-dnd-gray-700 text-white rounded border border-dnd-gray-600 focus:border-dnd-gold focus:outline-none"
                    >
                      <option value="">Select a token...</option>
                      {tokens.map(token => (
                        <option key={token.id} value={token.id}>
                          {token.name || `Token ${token.id.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Round Info */}
                <div className="bg-dnd-gray-700 px-3 py-2 rounded">
                  <span className="text-sm text-gray-400">Scheduling for: </span>
                  <span className="text-white font-bold">Round {targetRound}</span>
                  <span className="text-xs text-gray-400 ml-2">(Next round)</span>
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Event Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setEventType('move')}
                      className={`px-3 py-2 rounded font-medium transition-all ${
                        eventType === 'move'
                          ? 'bg-blue-600 text-white'
                          : 'bg-dnd-gray-700 text-gray-300 hover:bg-dnd-gray-600'
                      }`}
                    >
                      <Move className="inline-block w-4 h-4 mr-1" />
                      Move
                    </button>
                    <button
                      onClick={() => setEventType('spell')}
                      className={`px-3 py-2 rounded font-medium transition-all ${
                        eventType === 'spell'
                          ? 'bg-purple-600 text-white'
                          : 'bg-dnd-gray-700 text-gray-300 hover:bg-dnd-gray-600'
                      }`}
                    >
                      <Zap className="inline-block w-4 h-4 mr-1" />
                      Spell
                    </button>
                    <button
                      onClick={() => setEventType('appear')}
                      className={`px-3 py-2 rounded font-medium transition-all ${
                        eventType === 'appear'
                          ? 'bg-green-600 text-white'
                          : 'bg-dnd-gray-700 text-gray-300 hover:bg-dnd-gray-600'
                      }`}
                    >
                      <Eye className="inline-block w-4 h-4 mr-1" />
                      Appear
                    </button>
                    <button
                      onClick={() => setEventType('disappear')}
                      className={`px-3 py-2 rounded font-medium transition-all ${
                        eventType === 'disappear'
                          ? 'bg-red-600 text-white'
                          : 'bg-dnd-gray-700 text-gray-300 hover:bg-dnd-gray-600'
                      }`}
                    >
                      <EyeOff className="inline-block w-4 h-4 mr-1" />
                      Disappear
                    </button>
                  </div>
                </div>

                {/* Event-specific Options */}
                {eventType === 'move' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Target Pos</label>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePositionPick}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all flex-shrink-0 ${
                          isPicking === 'to'
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-dnd-gold text-dnd-black hover:bg-yellow-500'
                        }`}
                        title="Click on map to set position"
                      >
                        <MapPin className="w-3 h-3" />
                      </button>
                      <div className="flex gap-2 flex-1 min-w-0">
                        <input
                          type="number"
                          value={targetPosition.x}
                          onChange={(e) => setTargetPosition({ ...targetPosition, x: parseInt(e.target.value) || 0 })}
                          placeholder="X"
                          className="flex-1 min-w-0 px-2 py-1 bg-dnd-gray-700 text-white rounded"
                        />
                        <input
                          type="number"
                          value={targetPosition.y}
                          onChange={(e) => setTargetPosition({ ...targetPosition, y: parseInt(e.target.value) || 0 })}
                          placeholder="Y"
                          className="flex-1 min-w-0 px-2 py-1 bg-dnd-gray-700 text-white rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {eventType === 'appear' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Appear Pos</label>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePositionPick}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all flex-shrink-0 ${
                          isPicking === 'to'
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-dnd-gold text-dnd-black hover:bg-yellow-500'
                        }`}
                        title="Click on map to set position"
                      >
                        <MapPin className="w-3 h-3" />
                      </button>
                      <div className="flex gap-2 flex-1 min-w-0">
                        <input
                          type="number"
                          value={targetPosition.x}
                          onChange={(e) => setTargetPosition({ ...targetPosition, x: parseInt(e.target.value) || 0 })}
                          placeholder="X"
                          className="flex-1 min-w-0 px-2 py-1 bg-dnd-gray-700 text-white rounded"
                        />
                        <input
                          type="number"
                          value={targetPosition.y}
                          onChange={(e) => setTargetPosition({ ...targetPosition, y: parseInt(e.target.value) || 0 })}
                          placeholder="Y"
                          className="flex-1 min-w-0 px-2 py-1 bg-dnd-gray-700 text-white rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Fade Effect Option for appear/disappear */}
                {(eventType === 'appear' || eventType === 'disappear') && (
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                      <input
                        type="checkbox"
                        checked={fadeEffect}
                        onChange={(e) => setFadeEffect(e.target.checked)}
                        className="rounded"
                      />
                      Use fade effect
                    </label>
                  </div>
                )}

                {/* Spell Target Position */}
                {eventType === 'spell' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Spell Target</label>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePositionPick}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all flex-shrink-0 ${
                          isPicking === 'to'
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-dnd-gold text-dnd-black hover:bg-yellow-500'
                        }`}
                        title="Click on map to set target position"
                      >
                        <MapPin className="w-3 h-3" />
                      </button>
                      <div className="flex gap-2 flex-1 min-w-0">
                        <input
                          type="number"
                          value={targetPosition.x}
                          onChange={(e) => setTargetPosition({ ...targetPosition, x: parseInt(e.target.value) || 0 })}
                          placeholder="X"
                          className="flex-1 min-w-0 px-2 py-1 bg-dnd-gray-700 text-white rounded"
                        />
                        <input
                          type="number"
                          value={targetPosition.y}
                          onChange={(e) => setTargetPosition({ ...targetPosition, y: parseInt(e.target.value) || 0 })}
                          placeholder="Y"
                          className="flex-1 min-w-0 px-2 py-1 bg-dnd-gray-700 text-white rounded"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Configure spell details in the left sidebar
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddEvent}
                disabled={eventType === 'spell' ? (!selectedToken && !useEnvironmentCaster) : !selectedToken}
                className="mt-4 px-4 py-2 bg-dnd-gold text-dnd-black rounded font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Plus className="inline-block w-4 h-4 mr-2" />
                Add Event
              </button>
              </div>
            </div>

            {/* Right Column - Existing Events List */}
            <div className="w-80 p-4 overflow-y-auto">
              <h3 className="text-lg font-medium text-white mb-3">Round {nextRound} Events</h3>

              {roundEvents.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No events scheduled for this round</p>
              ) : (
                <div className="space-y-2">
                  {roundEvents.map((event) => {
                    const token = tokens.find(t => t.id === event.tokenId)
                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-dnd-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${
                            event.type === 'move' ? 'bg-blue-600' :
                            event.type === 'appear' ? 'bg-green-600' :
                            'bg-red-600'
                          }`}>
                            {event.type === 'move' && <Move className="w-4 h-4 text-white" />}
                            {event.type === 'appear' && <Eye className="w-4 h-4 text-white" />}
                            {event.type === 'disappear' && <EyeOff className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {token?.name || 'Unknown Token'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {event.type === 'move' && 'Move to new position'}
                              {event.type === 'appear' && 'Appear on map'}
                              {event.type === 'disappear' && 'Disappear from map'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-dnd-gray-700 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer - Spans both columns */}
          <div className="flex justify-end gap-2 p-3 border-t border-dnd-gray-700 bg-dnd-gray-800/50">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dnd-gray-700 text-gray-300 rounded hover:bg-dnd-gray-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}