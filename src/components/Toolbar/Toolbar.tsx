import React, { useState } from 'react'
import useToolStore from '@store/toolStore'
import useRoundStore from '@store/roundStore'
import { TOOLS, ToolType } from '@/types/tools'
import ToolButton from './ToolButton'
import { Calendar } from 'lucide-react'
import { EventEditor } from '../Timeline/EventEditor'

const Toolbar: React.FC = () => {
  const { currentTool, setTool } = useToolStore()
  const { isInCombat } = useRoundStore()
  const [showEventEditor, setShowEventEditor] = useState(false)

  // Define which tools to show in the toolbar
  const visibleTools: ToolType[] = [
    'select',
    'rectangle',
    'circle',
    'token',
    'staticObject',
    'spellEffect',
    'pan',
    'measure',
    'text',
    'eraser'
  ]

  return (
    <div className="w-16 bg-dnd-black border-r border-dnd-gray-800 flex flex-col items-center py-2">
      <div className="text-xs text-gray-500 mb-3">Tools</div>

      <div className="flex flex-col gap-1 w-full px-2">
        {visibleTools.map((toolId) => {
          const tool = TOOLS[toolId]
          return (
            <ToolButton
              key={tool.id}
              tool={tool}
              isActive={currentTool === tool.id}
              onClick={() => setTool(tool.id)}
            />
          )
        })}
      </div>

      {/* Divider */}
      <div className="w-full px-2 my-3">
        <div className="border-t border-dnd-gray-800" />
      </div>

      {/* Event Management Button (only in combat) */}
      {isInCombat && (
        <>
          <button
            onClick={() => setShowEventEditor(true)}
            className="w-12 h-12 flex flex-col items-center justify-center rounded hover:bg-dnd-gray-800 transition-colors text-dnd-gold"
            title="Manage Events"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs mt-1">Events</span>
          </button>

          <div className="w-full px-2 my-3">
            <div className="border-t border-dnd-gray-800" />
          </div>
        </>
      )}

      {/* Color indicators */}
      <div className="flex flex-col gap-2 px-2">
        <ColorIndicator type="fill" />
        <ColorIndicator type="stroke" />
      </div>

      {/* Event Editor Dialog */}
      <EventEditor
        isOpen={showEventEditor}
        onClose={() => setShowEventEditor(false)}
      />
    </div>
  )
}

const ColorIndicator: React.FC<{ type: 'fill' | 'stroke' }> = ({ type }) => {
  const { fillColor, strokeColor } = useToolStore()
  const color = type === 'fill' ? fillColor : strokeColor

  return (
    <div className="relative group">
      <div
        className="w-10 h-10 rounded border-2 border-dnd-gray-700 cursor-pointer hover:border-dnd-gray-600 transition-colors"
        style={{ backgroundColor: type === 'fill' ? color : 'transparent' }}
        title={type === 'fill' ? 'Fill Color' : 'Stroke Color'}
      >
        {type === 'stroke' && (
          <div
            className="w-full h-full rounded"
            style={{
              border: `3px solid ${color}`,
              boxSizing: 'border-box'
            }}
          />
        )}
      </div>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-dnd-gray-800 rounded-full text-xs text-gray-400 flex items-center justify-center">
        {type === 'fill' ? 'F' : 'S'}
      </div>
    </div>
  )
}

export default Toolbar