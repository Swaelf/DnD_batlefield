import React, { useState, useEffect, useMemo } from 'react';
import useMapStore from '@/store/mapStore';
import { Shape } from '@/types/map';
import { Token } from '@/types/token';
import { ColorPicker } from './ColorPicker';
import { LayerControls } from './LayerControls';
import { Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import { nanoid } from 'nanoid';
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelBody,
  PanelSection,
  Input,
  NumberInput,
  Field,
  FieldLabel,
  Select,
  SelectOption,
  Button,
  Text,
  Box
} from '@/components/ui';

const PropertiesPanel: React.FC = () => {
  // Use specific selectors to prevent unnecessary re-renders
  const selectedObjects = useMapStore(state => state.selectedObjects) as string[];
  const currentMap = useMapStore(state => state.currentMap);
  const updateObject = useMapStore(state => state.updateObject);
  const deleteSelected = useMapStore(state => state.deleteSelected);
  const addObject = useMapStore(state => state.addObject);

  // Get selected object with memoization
  const selectedObject = useMemo(() => {
    if (selectedObjects.length !== 1) return null;
    return currentMap?.objects.find(obj => obj.id === selectedObjects[0]) || null;
  }, [selectedObjects, currentMap?.objects]);

  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 });
  const [localRotation, setLocalRotation] = useState(0);
  const [localOpacity, setLocalOpacity] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  // Update local state when selection changes
  useEffect(() => {
    if (selectedObject) {
      setLocalPosition(selectedObject.position);
      setLocalRotation(selectedObject.rotation || 0);
      setLocalOpacity(selectedObject.opacity || 1);
      setIsVisible(selectedObject.visible !== false);
    }
  }, [selectedObject]);

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (!selectedObject) return;
    const newPosition = { ...localPosition, [axis]: value };
    setLocalPosition(newPosition);
    updateObject(selectedObject.id, { position: newPosition });
  };

  const handleRotationChange = (value: number) => {
    if (!selectedObject) return;
    setLocalRotation(value);
    updateObject(selectedObject.id, { rotation: value });
  };

  const handleOpacityChange = (value: number) => {
    if (!selectedObject) return;
    setLocalOpacity(value);
    updateObject(selectedObject.id, { opacity: value });
  };

  const handleVisibilityToggle = () => {
    if (!selectedObject) return;
    const newVisible = !isVisible;
    setIsVisible(newVisible);
    updateObject(selectedObject.id, { visible: newVisible });
  };

  const handleColorChange = (property: 'fill' | 'stroke' | 'color', color: string) => {
    if (!selectedObject) return;
    updateObject(selectedObject.id, { [property]: color });
  };

  const handleDuplicate = () => {
    if (!selectedObject) return;
    const newObject = {
      ...selectedObject,
      id: nanoid(),
      position: {
        x: selectedObject.position.x + 20,
        y: selectedObject.position.y + 20,
      }
    };
    addObject(newObject);
  };

  const renderShapeProperties = (shape: Shape) => (
    <PanelSection>
      <Field>
        <FieldLabel>Fill Color</FieldLabel>
        <ColorPicker
          color={shape.fill}
          onChange={(color) => handleColorChange('fill', color)}
        />
      </Field>

      <Field>
        <FieldLabel>Stroke Color</FieldLabel>
        <ColorPicker
          color={shape.stroke}
          onChange={(color) => handleColorChange('stroke', color)}
        />
      </Field>

      <Field>
        <FieldLabel>Stroke Width</FieldLabel>
        <NumberInput
          value={shape.strokeWidth}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateObject(selectedObject!.id, { strokeWidth: Number(e.target.value) } as Partial<Shape>)}
          min={0}
          max={20}
          fullWidth
          size="sm"
        />
      </Field>

      {(shape.shapeType === 'rect' || shape.shapeType === 'rectangle') && (
        <>
          <Box display="grid" css={{ gridTemplateColumns: '1fr 1fr', gap: '$3' }}>
            <Field>
              <FieldLabel>Width</FieldLabel>
              <NumberInput
                value={shape.width}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateObject(selectedObject!.id, { width: Number(e.target.value) } as Partial<Shape>)}
                fullWidth
                size="sm"
              />
            </Field>
            <Field>
              <FieldLabel>Height</FieldLabel>
              <NumberInput
                value={shape.height}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateObject(selectedObject!.id, { height: Number(e.target.value) } as Partial<Shape>)}
                fullWidth
                size="sm"
              />
            </Field>
          </Box>
        </>
      )}

      {shape.shapeType === 'circle' && (
        <Field>
          <FieldLabel>Radius</FieldLabel>
          <NumberInput
            value={shape.radius}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateObject(selectedObject!.id, { radius: Number(e.target.value) } as Partial<Shape>)}
            fullWidth
            size="sm"
          />
        </Field>
      )}
    </PanelSection>
  );

  const renderTokenProperties = (token: Token) => (
    <PanelSection>
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input
          value={token.name || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateObject(selectedObject!.id, { name: e.target.value })}
          placeholder="Token name"
          fullWidth
          size="sm"
        />
      </Field>

      <Field>
        <FieldLabel>Size</FieldLabel>
        <Select
          value={token.size}
          onValueChange={(value) => updateObject(selectedObject!.id, { size: value as Token['size'] } as Partial<Token>)}
          size="sm"
          fullWidth
        >
          <SelectOption value="tiny">Tiny (2.5ft)</SelectOption>
          <SelectOption value="small">Small (5ft)</SelectOption>
          <SelectOption value="medium">Medium (5ft)</SelectOption>
          <SelectOption value="large">Large (10ft)</SelectOption>
          <SelectOption value="huge">Huge (15ft)</SelectOption>
          <SelectOption value="gargantuan">Gargantuan (20ft+)</SelectOption>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Color</FieldLabel>
        <ColorPicker
          color={token.color}
          onChange={(color) => handleColorChange('color', color)}
        />
      </Field>

      <Field>
        <FieldLabel>Shape</FieldLabel>
        <Box display="flex" gap="2">
          <Button
            onClick={() => updateObject(selectedObject!.id, { shape: 'circle' } as Partial<Token>)}
            variant={token.shape === 'circle' ? 'primary' : 'outline'}
            size="sm"
            fullWidth
          >
            Circle
          </Button>
          <Button
            onClick={() => updateObject(selectedObject!.id, { shape: 'square' } as Partial<Token>)}
            variant={token.shape === 'square' ? 'primary' : 'outline'}
            size="sm"
            fullWidth
          >
            Square
          </Button>
        </Box>
      </Field>

      <Field>
        <Box display="flex" alignItems="center" gap="2">
          <input
            type="checkbox"
            id="showLabel"
            checked={token.showLabel || false}
            onChange={(e) => updateObject(selectedObject!.id, { showLabel: e.target.checked } as Partial<Token>)}
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: 'var(--colors-gray800)',
              borderColor: 'var(--colors-gray600)',
              borderRadius: '4px',
            }}
          />
          <FieldLabel htmlFor="showLabel" css={{ margin: 0, cursor: 'pointer' }}>
            Show Label
          </FieldLabel>
        </Box>
      </Field>

      {token.showLabel && (
        <Field>
          <FieldLabel>Label Position</FieldLabel>
          <Select
            value={token.labelPosition || 'bottom'}
            onValueChange={(value) => updateObject(selectedObject!.id, { labelPosition: value as Token['labelPosition'] } as Partial<Token>)}
            size="sm"
            fullWidth
          >
            <SelectOption value="top">Top</SelectOption>
            <SelectOption value="bottom">Bottom</SelectOption>
          </Select>
        </Field>
      )}
    </PanelSection>
  );

  if (selectedObjects.length === 0) {
    return (
      <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
        <PanelHeader>
          <PanelTitle>Properties</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <Text size="sm" color="gray400">Select an object to edit its properties</Text>
        </PanelBody>
      </Panel>
    );
  }

  if (selectedObjects.length > 1) {
    return (
      <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
        <PanelHeader>
          <PanelTitle>Multiple Selection</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <Text size="sm" color="gray300" css={{ marginBottom: '$4' }}>
            {selectedObjects.length} objects selected
          </Text>
          <Button
            onClick={deleteSelected}
            variant="destructive"
            fullWidth
            size="sm"
          >
            <Trash2 size={16} />
            Delete Selected
          </Button>
        </PanelBody>
      </Panel>
    );
  }

  if (!selectedObject) return null;

  return (
    <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
      <PanelHeader>
        <PanelTitle>Properties</PanelTitle>
      </PanelHeader>

      <PanelBody>
        {/* Object Type */}
        <PanelSection css={{ marginBottom: '$4' }}>
          <Box display="flex" alignItems="center" gap="2">
            <Text size="xs" color="gray400">Type:</Text>
            <Text size="sm" weight="medium" transform="capitalize">{selectedObject.type}</Text>
          </Box>
        </PanelSection>

        {/* Position */}
        <PanelSection divider>
          <Box display="grid" css={{ gridTemplateColumns: '1fr 1fr', gap: '$2' }}>
            <Field>
              <FieldLabel>X Position</FieldLabel>
              <NumberInput
                value={Math.round(localPosition.x)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePositionChange('x', Number(e.target.value))}
                fullWidth
                size="sm"
              />
            </Field>
            <Field>
              <FieldLabel>Y Position</FieldLabel>
              <NumberInput
                value={Math.round(localPosition.y)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePositionChange('y', Number(e.target.value))}
                fullWidth
                size="sm"
              />
            </Field>
          </Box>

          <Field>
            <FieldLabel>Rotation</FieldLabel>
            <Box display="flex" alignItems="center" gap="2">
              <input
                type="range"
                value={localRotation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRotationChange(Number(e.target.value))}
                min="0"
                max="360"
                style={{ flex: 1 }}
              />
              <Text size="sm" css={{ minWidth: '40px', textAlign: 'right' }}>
                {localRotation}°
              </Text>
            </Box>
          </Field>

          <Field>
            <FieldLabel>Opacity</FieldLabel>
            <Box display="flex" alignItems="center" gap="2">
              <input
                type="range"
                value={localOpacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                min="0"
                max="1"
                step="0.1"
                style={{ flex: 1 }}
              />
              <Text size="sm" css={{ minWidth: '40px', textAlign: 'right' }}>
                {Math.round(localOpacity * 100)}%
              </Text>
            </Box>
          </Field>
        </PanelSection>

        {/* Type-specific properties */}
        {selectedObject.type === 'shape' && renderShapeProperties(selectedObject as Shape)}
        {selectedObject.type === 'token' && renderTokenProperties(selectedObject as Token)}

        {/* Layer Controls */}
        <PanelSection divider>
          <LayerControls selectedObject={selectedObject} />
        </PanelSection>

        {/* Actions */}
        <PanelSection>
          <Box display="flex" flexDirection="column" gap="2">
            <Button
              onClick={handleVisibilityToggle}
              variant="ghost"
              fullWidth
              size="sm"
            >
              {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              {isVisible ? 'Hide' : 'Show'}
            </Button>

            <Button
              onClick={handleDuplicate}
              variant="ghost"
              fullWidth
              size="sm"
            >
              <Copy size={16} />
              Duplicate
            </Button>

            <Button
              onClick={deleteSelected}
              variant="destructive"
              fullWidth
              size="sm"
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </Box>
        </PanelSection>
      </PanelBody>
    </Panel>
  );
};

export default React.memo(PropertiesPanel);