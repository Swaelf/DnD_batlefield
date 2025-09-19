import { useEffect } from 'react'
import Konva from 'konva'

type CursorManagerProps = {
  stageRef: React.RefObject<Konva.Stage>
  currentTool: string
  isPicking: 'from' | 'to' | 'token' | null
}

export const useCursorManager = ({
  stageRef,
  currentTool,
  isPicking
}: CursorManagerProps) => {
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const container = stage.container()

    // Override cursor when picking positions or tokens
    if (isPicking === 'from' || isPicking === 'to') {
      container.style.cursor = 'crosshair'
      return
    } else if (isPicking === 'token') {
      container.style.cursor = 'pointer'
      return
    }

    switch (currentTool) {
      case 'pan':
        container.style.cursor = 'grab'
        break
      case 'eraser':
        container.style.cursor = 'crosshair'
        break
      case 'measure':
        container.style.cursor = 'crosshair'
        break
      case 'rectangle':
      case 'circle':
        container.style.cursor = 'crosshair'
        break
      case 'token':
        container.style.cursor = 'copy'
        break
      case 'staticObject':
        container.style.cursor = 'copy'
        break
      case 'spellEffect':
        container.style.cursor = 'copy'
        break
      case 'text':
        container.style.cursor = 'text'
        break
      case 'select':
      default:
        container.style.cursor = 'default'
        break
    }
  }, [currentTool, isPicking, stageRef])
}