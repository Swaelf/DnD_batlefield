import { type FC } from 'react';
import useMapStore from '@/store/mapStore';
import type { MapObject } from '@/types/map';
import { ArrowUp, ArrowDown, ArrowUpToLine, ArrowDownToLine } from '@/utils/optimizedIcons';

type LayerControlsProps = {
  selectedObject: MapObject;
}

export const LayerControls: FC<LayerControlsProps> = ({ selectedObject }) => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore(state => state.currentMap);
  const updateObject = useMapStore(state => state.updateObject);

  if (!currentMap) return null;

  const currentLayer = selectedObject.layer;
  const objects = currentMap.objects;
  const sortedObjects = [...objects].sort((a, b) => a.layer - b.layer);
  const objectIndex = sortedObjects.findIndex(obj => obj.id === selectedObject.id);
  const maxLayer = Math.max(...objects.map(obj => obj.layer));
  const minLayer = Math.min(...objects.map(obj => obj.layer));

  const moveLayer = (direction: 'up' | 'down' | 'top' | 'bottom') => {
    let newLayer = currentLayer;

    switch (direction) {
      case 'up':
        // Find the next object above
        const objectAbove = sortedObjects
          .slice(objectIndex + 1)
          .find(obj => obj.layer > currentLayer);
        if (objectAbove) {
          newLayer = objectAbove.layer;
          // Swap layers
          updateObject(objectAbove.id, { layer: currentLayer });
        } else {
          newLayer = currentLayer + 1;
        }
        break;

      case 'down':
        // Find the next object below
        const objectBelow = sortedObjects
          .slice(0, objectIndex)
          .reverse()
          .find(obj => obj.layer < currentLayer);
        if (objectBelow) {
          newLayer = objectBelow.layer;
          // Swap layers
          updateObject(objectBelow.id, { layer: currentLayer });
        } else {
          newLayer = Math.max(0, currentLayer - 1);
        }
        break;

      case 'top':
        newLayer = maxLayer + 1;
        break;

      case 'bottom':
        // Move all other objects up by 1
        objects.forEach(obj => {
          if (obj.id !== selectedObject.id && obj.layer <= currentLayer) {
            updateObject(obj.id, { layer: obj.layer + 1 });
          }
        });
        newLayer = 0;
        break;
    }

    updateObject(selectedObject.id, { layer: newLayer });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-d20-gold">Layer Order</h4>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Layer {currentLayer} of {maxLayer}
        </span>
        <span className="text-xs text-gray-500">
          ({objects.length} total objects)
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1">
        <button
          onClick={() => moveLayer('bottom')}
          disabled={currentLayer === minLayer}
          className="p-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 rounded text-white transition-colors"
          title="Send to Back"
        >
          <ArrowDownToLine className="h-4 w-4" />
        </button>

        <button
          onClick={() => moveLayer('down')}
          disabled={currentLayer === minLayer}
          className="p-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 rounded text-white transition-colors"
          title="Send Backward"
        >
          <ArrowDown className="h-4 w-4" />
        </button>

        <button
          onClick={() => moveLayer('up')}
          disabled={currentLayer === maxLayer}
          className="p-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 rounded text-white transition-colors"
          title="Bring Forward"
        >
          <ArrowUp className="h-4 w-4" />
        </button>

        <button
          onClick={() => moveLayer('top')}
          disabled={currentLayer === maxLayer}
          className="p-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 rounded text-white transition-colors"
          title="Bring to Front"
        >
          <ArrowUpToLine className="h-4 w-4" />
        </button>
      </div>

      {/* Visual layer stack */}
      <div className="space-y-1">
        <p className="text-xs text-gray-400">Layer Stack:</p>
        <div className="flex flex-col-reverse gap-1">
          {sortedObjects.slice(-5).map(obj => (
            <div
              key={obj.id}
              className={`px-2 py-1 text-xs rounded ${
                obj.id === selectedObject.id
                  ? 'bg-d20-red text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <span className="font-mono">L{obj.layer}:</span>
              <span className="ml-2">{obj.type}</span>
              {obj.name && <span className="ml-1 text-gray-500">({obj.name})</span>}
            </div>
          ))}
          {objects.length > 5 && (
            <div className="text-xs text-gray-500 text-center">
              ... {objects.length - 5} more objects
            </div>
          )}
        </div>
      </div>
    </div>
  );
};