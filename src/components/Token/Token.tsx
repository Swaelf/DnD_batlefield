import React from 'react';
import { Circle, Text, Group, Rect } from 'react-konva';
import Konva from 'konva';
import { Token as TokenType, TokenSize } from '@/types/token';

// Size multipliers for D&D creature sizes (in grid squares)
const SIZE_MAP: Record<TokenSize, number> = {
  tiny: 0.5,
  small: 1,
  medium: 1,
  large: 2,
  huge: 3,
  gargantuan: 4,
};

interface TokenProps {
  token: TokenType;
  gridSize: number;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDragStart?: () => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  isDraggable?: boolean;
}

export const Token: React.FC<TokenProps> = ({
  token,
  gridSize,
  isSelected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDraggable = true,
}) => {
  const sizeInSquares = SIZE_MAP[token.size];
  const radius = (gridSize * sizeInSquares) / 2;

  // Calculate label position and size
  const fontSize = Math.max(12, radius / 3);
  const labelY = token.labelPosition === 'bottom' ? radius + 10 : -radius - 10 - fontSize;

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (onSelect) {
      onSelect(token.id);
    }
  };

  return (
    <Group
      x={token.position.x}
      y={token.position.y}
      rotation={token.rotation}
      draggable={isDraggable}
      onClick={handleClick}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    >
      {/* Token background/border */}
      {token.shape === 'circle' ? (
        <>
          {/* Shadow for depth */}
          <Circle
            radius={radius + 2}
            fill="rgba(0, 0, 0, 0.3)"
            offsetX={-2}
            offsetY={2}
          />

          {/* Main token circle */}
          <Circle
            radius={radius}
            fill={token.color}
            stroke={token.borderColor || '#000000'}
            strokeWidth={token.borderWidth || 2}
            opacity={token.opacity}
          />

          {/* Selection indicator */}
          {isSelected && (
            <Circle
              radius={radius + 4}
              stroke="#C9AD6A"
              strokeWidth={3}
              dash={[8, 4]}
            />
          )}
        </>
      ) : (
        <>
          {/* Square token variant */}
          <Rect
            width={gridSize * sizeInSquares}
            height={gridSize * sizeInSquares}
            offsetX={(gridSize * sizeInSquares) / 2}
            offsetY={(gridSize * sizeInSquares) / 2}
            fill={token.color}
            stroke={token.borderColor || '#000000'}
            strokeWidth={token.borderWidth || 2}
            opacity={token.opacity}
            shadowColor="rgba(0, 0, 0, 0.3)"
            shadowBlur={4}
            shadowOffsetX={2}
            shadowOffsetY={2}
          />

          {/* Selection indicator for square */}
          {isSelected && (
            <Rect
              width={gridSize * sizeInSquares + 8}
              height={gridSize * sizeInSquares + 8}
              offsetX={(gridSize * sizeInSquares + 8) / 2}
              offsetY={(gridSize * sizeInSquares + 8) / 2}
              stroke="#C9AD6A"
              strokeWidth={3}
              dash={[8, 4]}
            />
          )}
        </>
      )}

      {/* Token label/name */}
      {token.name && token.showLabel && (
        <Text
          text={token.name}
          fontSize={fontSize}
          fontFamily="'Scala Sans', sans-serif"
          fill={token.labelColor || '#FFFFFF'}
          stroke="#000000"
          strokeWidth={1}
          align="center"
          offsetX={fontSize * token.name.length * 0.3}
          y={labelY}
        />
      )}

      {/* Initiative indicator (optional) */}
      {token.initiative !== undefined && (
        <Group x={radius - 15} y={-radius - 15}>
          <Circle
            radius={15}
            fill="#922610"
            stroke="#C9AD6A"
            strokeWidth={2}
          />
          <Text
            text={token.initiative.toString()}
            fontSize={14}
            fontFamily="'Scala Sans', sans-serif"
            fill="#FFFFFF"
            align="center"
            verticalAlign="middle"
            offsetX={token.initiative < 10 ? 4 : 7}
            offsetY={7}
          />
        </Group>
      )}

      {/* Condition markers (optional) */}
      {token.conditions && token.conditions.length > 0 && (
        <Group x={-radius + 5} y={-radius + 5}>
          {token.conditions.map((condition, index) => (
            <Circle
              key={condition}
              x={index * 12}
              radius={5}
              fill={getConditionColor(condition)}
              stroke="#000000"
              strokeWidth={1}
            />
          ))}
        </Group>
      )}
    </Group>
  );
};

// Helper function for condition colors
function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    stunned: '#FFD700',
    poisoned: '#4B0082',
    prone: '#8B4513',
    restrained: '#808080',
    frightened: '#FF4500',
    paralyzed: '#4169E1',
    invisible: '#D3D3D3',
    blinded: '#000000',
  };
  return colors[condition] || '#FF0000';
}