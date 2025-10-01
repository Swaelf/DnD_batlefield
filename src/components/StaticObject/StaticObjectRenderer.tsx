import { type FC } from 'react'
import { Group, Path, Rect, Circle, Ellipse, Line as KonvaLine } from 'react-konva'
import type { Shape } from '@/types/map'

type StaticObjectRendererProps = {
  shape: Shape
  isSelected: boolean
  isDraggable: boolean
  onClick: (e: any) => void
  onDragEnd: (e: any) => void
  onContextMenu: (e: any) => void
  onMouseEnter: (e: any) => void
  onMouseLeave: (e: any) => void
}

export const StaticObjectRenderer: FC<StaticObjectRendererProps> = ({
  shape,
  isSelected,
  isDraggable,
  onClick,
  onDragEnd,
  onContextMenu,
  onMouseEnter,
  onMouseLeave
}) => {
  const commonProps = {
    id: shape.id,
    draggable: isDraggable,
    onClick,
    onDragEnd,
    onContextMenu,
    onMouseEnter,
    onMouseLeave
  }

  const shadowConfig = {
    shadowColor: '#000000',
    shadowBlur: isSelected ? 10 : 4,
    shadowOpacity: 0.6,
    shadowOffset: { x: 4, y: 6 }
  }

  const baseColor = shape.fill || shape.fillColor
  const strokeColor = isSelected ? '#C9AD6A' : (shape.stroke || shape.strokeColor)
  const strokeWidth = isSelected ? 3 : (shape.strokeWidth || 2)

  // Determine object type based on shape properties
  const objectType = getObjectType(shape)

  const renderWall = () => (
    <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
      <Rect
        width={shape.width}
        height={shape.height}
        fill={baseColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        cornerRadius={2}
        {...shadowConfig}
      />
      {/* Brick pattern */}
      <Rect x={0} y={shape.height! * 0.25} width={shape.width! * 0.45} height={1} fill="rgba(0,0,0,0.2)" listening={false} />
      <Rect x={shape.width! * 0.55} y={shape.height! * 0.25} width={shape.width! * 0.45} height={1} fill="rgba(0,0,0,0.2)" listening={false} />
      <Rect x={0} y={shape.height! * 0.75} width={shape.width! * 0.45} height={1} fill="rgba(0,0,0,0.2)" listening={false} />
      <Rect x={shape.width! * 0.55} y={shape.height! * 0.75} width={shape.width! * 0.45} height={1} fill="rgba(0,0,0,0.2)" listening={false} />
    </Group>
  )

  const renderDoor = () => (
    <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
      <Rect
        width={shape.width}
        height={shape.height}
        fill={baseColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        cornerRadius={2}
        {...shadowConfig}
      />
      {/* Door panels */}
      <Rect x={shape.width! * 0.1} y={shape.height! * 0.05} width={shape.width! * 0.8} height={shape.height! * 0.4} fill="rgba(0,0,0,0.15)" cornerRadius={1} listening={false} />
      <Rect x={shape.width! * 0.1} y={shape.height! * 0.5} width={shape.width! * 0.8} height={shape.height! * 0.4} fill="rgba(0,0,0,0.15)" cornerRadius={1} listening={false} />
      {/* Door handle */}
      <Circle x={shape.width! * 0.85} y={shape.height! * 0.5} radius={Math.min(shape.width!, shape.height!) * 0.05} fill="#C9AD6A" listening={false} />
    </Group>
  )

  const renderPillar = () => (
    <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
      {/* Outer circle */}
      <Circle
        radius={shape.radius}
        fill={baseColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        {...shadowConfig}
      />
      {/* Darker center */}
      <Circle radius={shape.radius! * 0.6} fill="rgba(0,0,0,0.3)" listening={false} />
    </Group>
  )

  const renderStairs = () => {
    const stepCount = 5
    const stepHeight = shape.height! / stepCount

    return (
      <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
        {/* Base rectangle */}
        <Rect
          width={shape.width}
          height={shape.height}
          fill={baseColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          cornerRadius={2}
          {...shadowConfig}
        />

        {/* Steps across */}
        {Array.from({ length: stepCount }).map((_, i) => (
          <Rect
            key={i}
            y={i * stepHeight}
            width={shape.width}
            height={stepHeight * 0.15}
            fill="rgba(0,0,0,0.2)"
            listening={false}
          />
        ))}

        {/* Directional arrow */}
        <Path
          data={`M ${shape.width! * 0.5} ${shape.height! * 0.2}
                 L ${shape.width! * 0.7} ${shape.height! * 0.5}
                 L ${shape.width! * 0.6} ${shape.height! * 0.5}
                 L ${shape.width! * 0.6} ${shape.height! * 0.8}
                 L ${shape.width! * 0.4} ${shape.height! * 0.8}
                 L ${shape.width! * 0.4} ${shape.height! * 0.5}
                 L ${shape.width! * 0.3} ${shape.height! * 0.5} Z`}
          fill="rgba(255,255,255,0.3)"
          listening={false}
        />
      </Group>
    )
  }

  const renderSpiralStairs = () => (
    <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
      {/* Outer circle */}
      <Circle
        radius={shape.radius}
        fill={baseColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        {...shadowConfig}
      />

      {/* Inner darker circle */}
      <Circle radius={shape.radius! * 0.75} fill="rgba(0,0,0,0.2)" listening={false} />

      {/* Spiral lines */}
      <Path
        data={`M ${shape.radius! * 0} ${-shape.radius! * 0.95} Q ${shape.radius! * 0.7} ${-shape.radius! * 0.5}, ${shape.radius! * 0.95} ${shape.radius! * 0}`}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={2}
        fill="none"
        listening={false}
      />
      <Path
        data={`M ${shape.radius! * 0.95} ${shape.radius! * 0} Q ${shape.radius! * 0.5} ${shape.radius! * 0.7}, ${shape.radius! * 0} ${shape.radius! * 0.95}`}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={2}
        fill="none"
        listening={false}
      />
      <Path
        data={`M ${shape.radius! * 0} ${shape.radius! * 0.95} Q ${-shape.radius! * 0.7} ${shape.radius! * 0.5}, ${-shape.radius! * 0.95} ${shape.radius! * 0}`}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={2}
        fill="none"
        listening={false}
      />

      {/* Center pillar */}
      <Circle radius={shape.radius! * 0.25} fill="rgba(0,0,0,0.4)" listening={false} />
    </Group>
  )

  const renderTree = () => (
    <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
      {/* Outer canopy shadow */}
      <Circle radius={shape.radius! * 1.2} fill={baseColor} opacity={0.15} listening={false} />
      {/* Main canopy */}
      <Circle
        radius={shape.radius}
        fill={baseColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth * 1.5}
        dash={[3, 2]}
        {...shadowConfig}
      />
      {/* Inner texture */}
      <Circle radius={shape.radius! * 0.7} fill={baseColor} opacity={0.3} listening={false} />
      {/* Highlights */}
      <Circle x={-shape.radius! * 0.3} y={shape.radius! * 0.1} radius={shape.radius! * 0.4} fill="rgba(0,0,0,0.15)" listening={false} />
      <Circle x={shape.radius! * 0.3} y={shape.radius! * 0.1} radius={shape.radius! * 0.4} fill="rgba(0,0,0,0.15)" listening={false} />
      <Circle x={0} y={-shape.radius! * 0.2} radius={shape.radius! * 0.4} fill="rgba(255,255,255,0.15)" listening={false} />
      {/* Trunk */}
      <Rect x={-shape.radius! * 0.1} y={shape.radius! * 0.6} width={shape.radius! * 0.2} height={shape.radius! * 0.8} fill="#8B4513" listening={false} />
      <Rect x={-shape.radius! * 0.05} y={shape.radius! * 0.6} width={shape.radius! * 0.05} height={shape.radius! * 0.8} fill="rgba(0,0,0,0.3)" listening={false} />
    </Group>
  )

  const renderBush = () => (
    <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
      <Circle x={-shape.radius! * 0.4} y={shape.radius! * 0.3} radius={shape.radius! * 0.8} fill={baseColor} opacity={0.9} listening={false} />
      <Circle x={shape.radius! * 0.4} y={shape.radius! * 0.3} radius={shape.radius! * 0.8} fill={baseColor} opacity={0.9} listening={false} />
      <Circle
        radius={shape.radius! * 0.7}
        fill={baseColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        {...shadowConfig}
      />
      <Circle x={-shape.radius! * 0.4} y={shape.radius! * 0.3} radius={shape.radius! * 0.5} fill="rgba(0,0,0,0.2)" listening={false} />
      <Circle x={shape.radius! * 0.4} y={shape.radius! * 0.3} radius={shape.radius! * 0.5} fill="rgba(0,0,0,0.2)" listening={false} />
      <Circle x={0} y={-shape.radius! * 0.1} radius={shape.radius! * 0.3} fill="rgba(255,255,255,0.2)" listening={false} />
    </Group>
  )

  const renderRock = () => (
    <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
      {/* Shadow */}
      <Ellipse y={shape.radius! * 0.8} radiusX={shape.radius! * 1.4} radiusY={shape.radius! * 0.2} fill="rgba(0,0,0,0.3)" listening={false} />
      {/* Main rock */}
      <Circle
        radius={shape.radius}
        fill={baseColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        {...shadowConfig}
      />
      {/* Shading facets */}
      <Path data="M 0 -0.8 L 0.6 0.2 L -0.6 0.2 Z" fill="rgba(0,0,0,0.2)" scaleX={shape.radius} scaleY={shape.radius} listening={false} />
      <Path data="M -0.4 -0.4 L 0 -0.8 L 0.4 -0.4 Z" fill="rgba(255,255,255,0.15)" scaleX={shape.radius} scaleY={shape.radius} listening={false} />
    </Group>
  )

  const renderWater = () => (
    <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
      <Rect
        width={shape.width}
        height={shape.height}
        fill={baseColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={0.7}
        cornerRadius={4}
        {...shadowConfig}
      />
      {/* Wave patterns */}
      <Path
        data={`M 0 ${shape.height! * 0.2} Q ${shape.width! * 0.25} ${shape.height! * 0.15}, ${shape.width! * 0.5} ${shape.height! * 0.2} T ${shape.width} ${shape.height! * 0.2}`}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={1}
        listening={false}
      />
      <Path
        data={`M 0 ${shape.height! * 0.5} Q ${shape.width! * 0.2} ${shape.height! * 0.45}, ${shape.width! * 0.4} ${shape.height! * 0.5} T ${shape.width! * 0.8} ${shape.height! * 0.5} T ${shape.width} ${shape.height! * 0.5}`}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
        listening={false}
      />
      {/* Bubbles */}
      <Circle x={shape.width! * 0.3} y={shape.height! * 0.4} radius={Math.min(shape.width!, shape.height!) * 0.02} fill="rgba(255,255,255,0.4)" listening={false} />
      <Circle x={shape.width! * 0.7} y={shape.height! * 0.6} radius={Math.min(shape.width!, shape.height!) * 0.015} fill="rgba(255,255,255,0.3)" listening={false} />
    </Group>
  )

  const renderFurniture = (type: 'table' | 'chair' | 'chest' | 'barrel') => {
    if (type === 'table') {
      return (
        <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
          <Rect
            width={shape.width}
            height={shape.height}
            fill={baseColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            cornerRadius={2}
            {...shadowConfig}
          />
          {/* Table top highlight */}
          <Rect x={shape.width! * 0.05} y={shape.height! * 0.1} width={shape.width! * 0.9} height={shape.height! * 0.15} fill="rgba(255,255,255,0.2)" cornerRadius={1} listening={false} />
          {/* Legs */}
          <Rect x={shape.width! * 0.1} y={shape.height! * 0.9} width={shape.width! * 0.1} height={shape.height! * 0.3} fill={baseColor} listening={false} />
          <Rect x={shape.width! * 0.8} y={shape.height! * 0.9} width={shape.width! * 0.1} height={shape.height! * 0.3} fill={baseColor} listening={false} />
        </Group>
      )
    }

    if (type === 'chair') {
      return (
        <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
          {/* Backrest */}
          <Rect x={shape.width! * 0.1} y={-shape.height! * 0.2} width={shape.width! * 0.8} height={shape.height! * 0.25} fill={baseColor} cornerRadius={1} listening={false} />
          {/* Seat */}
          <Rect
            width={shape.width}
            height={shape.height}
            fill={baseColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            cornerRadius={2}
            {...shadowConfig}
          />
          <Rect x={shape.width! * 0.05} y={shape.height! * 0.1} width={shape.width! * 0.9} height={shape.height! * 0.15} fill="rgba(255,255,255,0.2)" cornerRadius={1} listening={false} />
          {/* Legs */}
          <Rect x={shape.width! * 0.15} y={shape.height! * 0.9} width={shape.width! * 0.12} height={shape.height! * 0.3} fill={baseColor} listening={false} />
          <Rect x={shape.width! * 0.73} y={shape.height! * 0.9} width={shape.width! * 0.12} height={shape.height! * 0.3} fill={baseColor} listening={false} />
        </Group>
      )
    }

    if (type === 'chest') {
      return (
        <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
          {/* Main chest body */}
          <Rect
            width={shape.width}
            height={shape.height}
            fill={baseColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            cornerRadius={3}
            {...shadowConfig}
          />

          {/* Curved lid - more pronounced */}
          <Path
            data={`M 0 0 Q ${shape.width! / 2} ${-shape.height! * 0.35}, ${shape.width} 0`}
            fill={baseColor}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={1.5}
            listening={false}
          />

          {/* Lid highlight */}
          <Path
            data={`M ${shape.width! * 0.15} ${-shape.height! * 0.2} Q ${shape.width! / 2} ${-shape.height! * 0.3}, ${shape.width! * 0.85} ${-shape.height! * 0.2}`}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={2}
            fill="none"
            listening={false}
          />

          {/* Corner metal reinforcements */}
          <Rect x={shape.width! * 0.05} y={shape.height! * 0.05} width={shape.width! * 0.12} height={shape.height! * 0.12} fill="rgba(0,0,0,0.3)" cornerRadius={1} listening={false} />
          <Rect x={shape.width! * 0.83} y={shape.height! * 0.05} width={shape.width! * 0.12} height={shape.height! * 0.12} fill="rgba(0,0,0,0.3)" cornerRadius={1} listening={false} />
          <Rect x={shape.width! * 0.05} y={shape.height! * 0.83} width={shape.width! * 0.12} height={shape.height! * 0.12} fill="rgba(0,0,0,0.3)" cornerRadius={1} listening={false} />
          <Rect x={shape.width! * 0.83} y={shape.height! * 0.83} width={shape.width! * 0.12} height={shape.height! * 0.12} fill="rgba(0,0,0,0.3)" cornerRadius={1} listening={false} />

          {/* Metal bands - more prominent */}
          <Rect x={shape.width! * 0.05} y={shape.height! * 0.25} width={shape.width! * 0.9} height={shape.height! * 0.06} fill="rgba(0,0,0,0.35)" cornerRadius={1} listening={false} />
          <Rect x={shape.width! * 0.05} y={shape.height! * 0.69} width={shape.width! * 0.9} height={shape.height! * 0.06} fill="rgba(0,0,0,0.3)" cornerRadius={1} listening={false} />

          {/* Metal band highlights */}
          <Rect x={shape.width! * 0.05} y={shape.height! * 0.25} width={shape.width! * 0.9} height={shape.height! * 0.015} fill="rgba(255,255,255,0.15)" listening={false} />
          <Rect x={shape.width! * 0.05} y={shape.height! * 0.69} width={shape.width! * 0.9} height={shape.height! * 0.015} fill="rgba(255,255,255,0.1)" listening={false} />

          {/* Large prominent lock plate */}
          <Rect x={shape.width! * 0.38} y={shape.height! * 0.42} width={shape.width! * 0.24} height={shape.height! * 0.35} fill="#C9AD6A" cornerRadius={2} listening={false} />

          {/* Lock plate border */}
          <Rect x={shape.width! * 0.38} y={shape.height! * 0.42} width={shape.width! * 0.24} height={shape.height! * 0.35} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={1} cornerRadius={2} listening={false} />

          {/* Keyhole */}
          <Circle x={shape.width! * 0.5} y={shape.height! * 0.55} radius={Math.min(shape.width!, shape.height!) * 0.08} fill="rgba(0,0,0,0.6)" listening={false} />

          {/* Keyhole opening */}
          <Rect x={shape.width! * 0.485} y={shape.height! * 0.57} width={shape.width! * 0.03} height={shape.height! * 0.1} fill="rgba(0,0,0,0.6)" listening={false} />

          {/* Lock shine */}
          <Circle x={shape.width! * 0.48} y={shape.height! * 0.52} radius={Math.min(shape.width!, shape.height!) * 0.03} fill="rgba(255,255,255,0.4)" listening={false} />
        </Group>
      )
    }

    // Barrel
    return (
      <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
        <Circle
          radius={shape.radius}
          fill={baseColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          {...shadowConfig}
        />
        <Circle radius={shape.radius! * 0.9} fill="rgba(0,0,0,0.2)" listening={false} />
        {/* Bands */}
        <KonvaLine points={[-shape.radius!, 0, shape.radius!, 0]} stroke="rgba(0,0,0,0.4)" strokeWidth={2} listening={false} />
        <KonvaLine points={[-shape.radius! * 0.9, -shape.radius! * 0.4, shape.radius! * 0.9, -shape.radius! * 0.4]} stroke="rgba(0,0,0,0.3)" strokeWidth={1.5} listening={false} />
        <KonvaLine points={[-shape.radius! * 0.9, shape.radius! * 0.4, shape.radius! * 0.9, shape.radius! * 0.4]} stroke="rgba(0,0,0,0.3)" strokeWidth={1.5} listening={false} />
        <Circle y={-shape.radius! * 0.7} radius={shape.radius! * 0.3} fill="rgba(255,255,255,0.1)" listening={false} />
      </Group>
    )
  }

  const renderDungeonObject = (type: 'trap' | 'altar' | 'brazier') => {
    if (type === 'trap') {
      return (
        <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
          <Rect
            width={shape.width}
            height={shape.height}
            fill="rgba(255,0,0,0.1)"
            stroke={strokeColor}
            strokeWidth={strokeWidth * 1.5}
            dash={[5, 5]}
            cornerRadius={2}
            {...shadowConfig}
          />
          {/* Trigger mechanism */}
          <Path data={`M ${shape.width! * 0.5} ${shape.height! * 0.25} L ${shape.width! * 0.75} ${shape.height! * 0.5} L ${shape.width! * 0.5} ${shape.height! * 0.75} L ${shape.width! * 0.25} ${shape.height! * 0.5} Z`} fill="#922610" listening={false} />
          <Path data={`M ${shape.width! * 0.5} ${shape.height! * 0.35} L ${shape.width! * 0.65} ${shape.height! * 0.5} L ${shape.width! * 0.5} ${shape.height! * 0.65} L ${shape.width! * 0.35} ${shape.height! * 0.5} Z`} fill="rgba(0,0,0,0.3)" listening={false} />
          <Circle x={shape.width! * 0.5} y={shape.height! * 0.5} radius={Math.min(shape.width!, shape.height!) * 0.05} fill="#C9AD6A" listening={false} />
          {/* Warning lines */}
          <KonvaLine points={[shape.width! * 0.15, shape.height! * 0.15, shape.width! * 0.85, shape.height! * 0.85]} stroke="rgba(255,0,0,0.2)" strokeWidth={1} listening={false} />
          <KonvaLine points={[shape.width! * 0.85, shape.height! * 0.15, shape.width! * 0.15, shape.height! * 0.85]} stroke="rgba(255,0,0,0.2)" strokeWidth={1} listening={false} />
        </Group>
      )
    }

    if (type === 'altar') {
      return (
        <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
          {/* Base */}
          <Rect y={shape.height! * 0.4} width={shape.width} height={shape.height! * 0.6} fill={baseColor} cornerRadius={2} {...shadowConfig} />
          {/* Platform */}
          <Rect y={shape.height! * 0.2} width={shape.width! * 1.2} height={shape.height! * 0.2} fill={baseColor} cornerRadius={1} listening={false} />
          <Rect x={shape.width! * 0.05} y={shape.height! * 0.22} width={shape.width! * 1.1} height={shape.height! * 0.05} fill="rgba(255,255,255,0.2)" listening={false} />
          {/* Sacred symbol */}
          <Path data={`M ${shape.width! * 0.5} 0 L ${shape.width! * 0.7} ${shape.height! * 0.2} L ${shape.width! * 0.3} ${shape.height! * 0.2} Z`} fill="#C9AD6A" listening={false} />
          <Path data={`M ${shape.width! * 0.5} ${shape.height! * 0.03} L ${shape.width! * 0.65} ${shape.height! * 0.18} L ${shape.width! * 0.35} ${shape.height! * 0.18} Z`} fill="rgba(255,255,255,0.3)" listening={false} />
          <Circle x={shape.width! * 0.5} y={shape.height! * 0.1} radius={Math.min(shape.width!, shape.height!) * 0.05} fill="rgba(255,255,255,0.4)" listening={false} />
        </Group>
      )
    }

    // Brazier
    return (
      <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
        {/* Stand */}
        <Rect x={shape.radius! * 0.7} y={shape.radius! * 0.4} width={shape.radius! * 0.6} height={shape.radius! * 1.2} fill={baseColor} listening={false} />
        <Rect x={shape.radius! * 0.75} y={shape.radius! * 0.4} width={shape.radius! * 0.1} height={shape.radius! * 1.2} fill="rgba(255,255,255,0.2)" listening={false} />
        {/* Flames */}
        <Circle radius={shape.radius! * 0.9} fill="#DC143C" opacity={0.8} {...shadowConfig} />
        <Circle radius={shape.radius! * 0.7} fill="#FF4500" opacity={0.6} listening={false} />
        <Circle radius={shape.radius! * 0.5} fill="#FFD700" opacity={0.8} listening={false} />
        {/* Flame licks */}
        <Path data={`M 0 ${-shape.radius! * 0.6} L ${shape.radius! * 0.2} ${-shape.radius! * 0.2} L ${-shape.radius! * 0.2} ${-shape.radius! * 0.2} Z`} fill="#FFD700" listening={false} />
        <Path data={`M ${-shape.radius! * 0.4} ${-shape.radius! * 0.5} L ${-shape.radius! * 0.2} ${-shape.radius! * 0.1} L ${-shape.radius! * 0.6} ${-shape.radius! * 0.1} Z`} fill="#FFA500" listening={false} />
        <Path data={`M ${shape.radius! * 0.4} ${-shape.radius! * 0.5} L ${shape.radius! * 0.6} ${-shape.radius! * 0.1} L ${shape.radius! * 0.2} ${-shape.radius! * 0.1} Z`} fill="#FFA500" listening={false} />
      </Group>
    )
  }

  // Route to appropriate renderer based on object type
  switch (objectType) {
    case 'wall':
      return renderWall()
    case 'door':
      return renderDoor()
    case 'pillar':
      return renderPillar()
    case 'stairs':
      return renderStairs()
    case 'spiral-stairs':
      return renderSpiralStairs()
    case 'tree':
      return renderTree()
    case 'bush':
      return renderBush()
    case 'rock':
      return renderRock()
    case 'water':
      return renderWater()
    case 'table':
      return renderFurniture('table')
    case 'chair':
      return renderFurniture('chair')
    case 'chest':
      return renderFurniture('chest')
    case 'barrel':
      return renderFurniture('barrel')
    case 'trap':
      return renderDungeonObject('trap')
    case 'altar':
      return renderDungeonObject('altar')
    case 'brazier':
      return renderDungeonObject('brazier')
    default:
      // Fallback to simple rectangle
      return (
        <Group {...commonProps} x={shape.position.x} y={shape.position.y} rotation={shape.rotation}>
          <Rect
            width={shape.width || 50}
            height={shape.height || 50}
            fill={baseColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            cornerRadius={4}
            {...shadowConfig}
          />
        </Group>
      )
  }
}

// Helper function to determine object type from shape properties
function getObjectType(shape: Shape): string {
  const color = shape.fill || shape.fillColor || ''

  // Walls
  if (color.includes('#6B7280') && shape.width && shape.height && shape.width > shape.height * 5) {
    return 'wall'
  }

  // Doors
  if (color.includes('#8B4513') && shape.width && shape.height && Math.abs(shape.width - shape.height) < 20) {
    return 'door'
  }

  // Pillars (circles with gray color)
  if (shape.shapeType === 'circle' && color.includes('#9CA3AF')) {
    return 'pillar'
  }

  // Stairs (rectangles with gray color and taller than wide)
  if (color.includes('#6B7280') && shape.width && shape.height && shape.height > shape.width) {
    return 'stairs'
  }

  // Spiral stairs (circles with dark gray)
  if (shape.shapeType === 'circle' && (color.includes('#5A5A5A') || color.includes('#5a5a5a'))) {
    return 'spiral-stairs'
  }

  // Trees (circles with green color)
  if (shape.shapeType === 'circle' && (color.includes('#10B981') || color.includes('#228B22'))) {
    return 'tree'
  }

  // Bushes (circles with darker green)
  if (shape.shapeType === 'circle' && (color.includes('#059669') || color.includes('#3CB371'))) {
    return 'bush'
  }

  // Rocks (circles with gray/brown)
  if (shape.shapeType === 'circle' && (color.includes('#78716C') || color.includes('#696969'))) {
    return 'rock'
  }

  // Brazier (circles with red/orange)
  if (shape.shapeType === 'circle' && (color.includes('#EA580C') || color.includes('#DC143C'))) {
    return 'brazier'
  }

  // Barrels (other circles)
  if (shape.shapeType === 'circle' && color.includes('#92400E')) {
    return 'barrel'
  }

  // Water
  if (color.includes('#3B82F6') && shape.opacity && shape.opacity < 0.8) {
    return 'water'
  }

  // Tables
  if (color.includes('#92400E') && shape.width && shape.height && shape.width > shape.height) {
    return 'table'
  }

  // Chairs
  if (color.includes('#78350F') && shape.width && shape.height && Math.abs(shape.width - shape.height) < 20) {
    return 'chair'
  }

  // Chests
  if (color.includes('#92400E') && shape.width && shape.height && shape.width < shape.height) {
    return 'chest'
  }

  // Traps
  if (color.includes('#EF4444') && shape.opacity && shape.opacity <= 0.5) {
    return 'trap'
  }

  // Altars
  if (color.includes('#6B7280') && shape.width && shape.height && shape.width < shape.height * 1.5) {
    return 'altar'
  }

  return 'default'
}