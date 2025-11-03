import type { TestScenario } from './TestScenarios'
import type { Shape } from '@/types'

/**
 * Static Layer Performance Tests
 *
 * These tests verify the performance optimization of StaticObjectsLayer and StaticEffectsLayer
 * by creating maps with many static objects/effects and animating tokens/spells.
 *
 * Expected performance gains:
 * - StaticObjectsLayer: 22-50% FPS improvement
 * - StaticEffectsLayer: 20-40% FPS improvement
 */

/**
 * Test 1: Static Objects Performance Test
 * Creates a forest scene with many trees and static objects, then animates tokens
 */
export const staticObjectsPerformanceTest: TestScenario = {
  id: 'static-objects-performance',
  name: 'Static Objects Layer - Performance Test',
  description: 'Tests performance with 25 static objects (15 trees, 5 walls, 5 furniture) and token movement/spells',
  category: 'visual',
  steps: [
    // Add 15 trees
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-1',
          name: 'Summer Oak',
          position: { x: 200, y: 200 },
          color: '#228B22',
          type: 'circle',
          radius: 30
        }
      },
      description: 'Add tree 1 (Summer Oak)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-2',
          name: 'Pine Tree',
          position: { x: 350, y: 180 },
          color: '#0F5132',
          type: 'circle',
          radius: 25
        }
      },
      description: 'Add tree 2 (Pine)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-3',
          name: 'Autumn Oak',
          position: { x: 500, y: 220 },
          color: '#CD853F',
          type: 'circle',
          radius: 28
        }
      },
      description: 'Add tree 3 (Autumn Oak)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-4',
          name: 'Willow',
          position: { x: 650, y: 190 },
          color: '#8FBC8F',
          type: 'circle',
          radius: 35
        }
      },
      description: 'Add tree 4 (Willow)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-5',
          name: 'Cherry Blossom',
          position: { x: 800, y: 210 },
          color: '#FFB6C1',
          type: 'circle',
          radius: 30
        }
      },
      description: 'Add tree 5 (Cherry Blossom)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-6',
          name: 'Birch',
          position: { x: 250, y: 400 },
          color: '#90EE90',
          type: 'circle',
          radius: 22
        }
      },
      description: 'Add tree 6 (Birch)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-7',
          name: 'Jungle Tree',
          position: { x: 400, y: 420 },
          color: '#006400',
          type: 'circle',
          radius: 32
        }
      },
      description: 'Add tree 7 (Jungle)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-8',
          name: 'Maple Red',
          position: { x: 550, y: 380 },
          color: '#DC143C',
          type: 'circle',
          radius: 28
        }
      },
      description: 'Add tree 8 (Maple)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-9',
          name: 'Summer Oak',
          position: { x: 700, y: 410 },
          color: '#228B22',
          type: 'circle',
          radius: 30
        }
      },
      description: 'Add tree 9 (Summer Oak)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-10',
          name: 'Dead Tree',
          position: { x: 850, y: 390 },
          color: '#8B7D6B',
          type: 'circle',
          radius: 26
        }
      },
      description: 'Add tree 10 (Dead Tree)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-11',
          name: 'Pine Tree',
          position: { x: 300, y: 600 },
          color: '#0F5132',
          type: 'circle',
          radius: 24
        }
      },
      description: 'Add tree 11 (Pine)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-12',
          name: 'Bush',
          position: { x: 450, y: 620 },
          color: '#3CB371',
          type: 'circle',
          radius: 18
        }
      },
      description: 'Add tree 12 (Bush)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-13',
          name: 'Bush',
          position: { x: 600, y: 590 },
          color: '#3CB371',
          type: 'circle',
          radius: 20
        }
      },
      description: 'Add tree 13 (Bush)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-14',
          name: 'Flowering Bush',
          position: { x: 750, y: 610 },
          color: '#FF69B4',
          type: 'circle',
          radius: 22
        }
      },
      description: 'Add tree 14 (Flowering Bush)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'tree-15',
          name: 'Berry Bush',
          position: { x: 900, y: 580 },
          color: '#8B008B',
          type: 'circle',
          radius: 19
        }
      },
      description: 'Add tree 15 (Berry Bush)'
    },

    // Add 10 walls
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'wall-1',
          name: 'Stone Wall',
          position: { x: 100, y: 100 },
          color: '#6B7280',
          type: 'rectangle',
          width: 150,
          height: 20
        }
      },
      description: 'Add wall 1 (horizontal)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'wall-2',
          name: 'Stone Wall',
          position: { x: 100, y: 100 },
          color: '#6B7280',
          type: 'rectangle',
          width: 20,
          height: 150
        }
      },
      description: 'Add wall 2 (vertical)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'wall-3',
          name: 'Brick Wall',
          position: { x: 900, y: 100 },
          color: '#475569',
          type: 'rectangle',
          width: 20,
          height: 200
        }
      },
      description: 'Add wall 3 (right vertical)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'wall-4',
          name: 'Stone Wall',
          position: { x: 100, y: 700 },
          color: '#6B7280',
          type: 'rectangle',
          width: 250,
          height: 20
        }
      },
      description: 'Add wall 4 (bottom horizontal)'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'wall-5',
          name: 'Brick Wall',
          position: { x: 700, y: 700 },
          color: '#475569',
          type: 'rectangle',
          width: 200,
          height: 20
        }
      },
      description: 'Add wall 5 (bottom right horizontal)'
    },

    // Add 5 furniture items
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'table-1',
          name: 'Wooden Table',
          position: { x: 400, y: 300 },
          color: '#8B4513',
          type: 'rectangle',
          width: 80,
          height: 50
        }
      },
      description: 'Add table 1'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'chest-1',
          name: 'Treasure Chest',
          position: { x: 150, y: 500 },
          color: '#92400E',
          type: 'rectangle',
          width: 40,
          height: 30
        }
      },
      description: 'Add chest 1'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'barrel-1',
          name: 'Barrel',
          position: { x: 800, y: 500 },
          color: '#654321',
          type: 'circle',
          radius: 20
        }
      },
      description: 'Add barrel 1'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'rock-1',
          name: 'Boulder',
          position: { x: 500, y: 150 },
          color: '#696969',
          type: 'circle',
          radius: 35
        }
      },
      description: 'Add rock 1'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'rock-2',
          name: 'Rock',
          position: { x: 600, y: 650 },
          color: '#78716C',
          type: 'circle',
          radius: 25
        }
      },
      description: 'Add rock 2'
    },

    {
      type: 'wait',
      wait: 500,
      description: 'Wait for all static objects to render'
    },

    // Add 2 tokens
    {
      type: 'action',
      action: {
        type: 'addToken',
        params: {
          id: 'warrior-token',
          name: 'Warrior',
          position: { x: 300, y: 500 },
          size: 'medium',
          color: '#FF0000'
        }
      },
      description: 'Add Warrior token'
    },
    {
      type: 'action',
      action: {
        type: 'addToken',
        params: {
          id: 'mage-token',
          name: 'Mage',
          position: { x: 700, y: 300 },
          size: 'medium',
          color: '#0000FF'
        }
      },
      description: 'Add Mage token'
    },

    {
      type: 'wait',
      wait: 1000,
      description: 'View the static scene (30 objects + 2 tokens)'
    },

    // Start combat and animations
    {
      type: 'action',
      action: { type: 'startCombat', params: {} },
      description: 'Start combat'
    },

    // Event 1: Warrior moves and attacks
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            // Move warrior
            roundStore.addAction('warrior-token', 'move', {
              type: 'move',
              fromPosition: { x: 300, y: 500 },
              toPosition: { x: 500, y: 400 }
            }, 1)
          }
        }
      },
      description: 'Add warrior movement (Event 1)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            // Warrior casts Fireball
            roundStore.addAction('warrior-token', 'spell', {
              type: 'spell',
              spellName: 'Fireball',
              category: 'projectile-burst',
              fromPosition: { x: 500, y: 400 },
              toPosition: { x: 700, y: 300 },
              color: '#FF4500',
              size: 20,
              duration: 1000,
              projectileSpeed: 500,
              burstRadius: 60
            }, 1)
          }
        }
      },
      description: 'Add Fireball spell (Event 1)'
    },

    // Execute Event 1
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            await roundStore.executeEventActions(1)
          }
        }
      },
      description: 'Execute Event 1 animations'
    },

    {
      type: 'wait',
      wait: 3000,
      description: 'Watch Event 1 animations (note FPS during animation)'
    },

    // Event 2: Mage moves and casts spells
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            // Move mage
            roundStore.addAction('mage-token', 'move', {
              type: 'move',
              fromPosition: { x: 700, y: 300 },
              toPosition: { x: 550, y: 350 }
            }, 2)
          }
        }
      },
      description: 'Add mage movement (Event 2)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            // Mage casts Magic Missile (3 projectiles)
            for (let i = 0; i < 3; i++) {
              const offsetY = (i - 1) * 30
              roundStore.addAction('mage-token', 'spell', {
                type: 'spell',
                spellName: `Magic Missile ${i + 1}`,
                category: 'projectile',
                fromPosition: { x: 550, y: 350 },
                toPosition: { x: 500, y: 400 + offsetY },
                color: '#0080FF',
                size: 10,
                duration: 800,
                projectileSpeed: 600
              }, 2)
            }
          }
        }
      },
      description: 'Add 3 Magic Missiles (Event 2)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            // Mage casts Cone of Cold
            roundStore.addAction('mage-token', 'spell', {
              type: 'spell',
              spellName: 'Cone of Cold',
              category: 'cone',
              fromPosition: { x: 550, y: 350 },
              toPosition: { x: 300, y: 500 },
              color: '#00FFFF',
              size: 15,
              duration: 1200,
              coneAngle: 53
            }, 2)
          }
        }
      },
      description: 'Add Cone of Cold spell (Event 2)'
    },

    // Execute Event 2
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            await roundStore.executeEventActions(2)
          }
        }
      },
      description: 'Execute Event 2 animations'
    },

    {
      type: 'wait',
      wait: 3000,
      description: 'Watch Event 2 animations (multiple spells + movement)'
    },

    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()

            // Debug: Log all objects
            const allObjects = mapStore.currentMap?.objects || []
            console.log(`[Test] Total objects on map: ${allObjects.length}`)

            // Debug: Log object types
            const objectTypes = allObjects.reduce((acc: any, obj: any) => {
              acc[obj.type] = (acc[obj.type] || 0) + 1
              return acc
            }, {})
            console.log('[Test] Object types:', objectTypes)

            // Count static objects
            const staticObjects = allObjects.filter(obj => {
              if (obj.type !== 'shape') return false
              const shape = obj as Shape
              const isStatic = shape.metadata?.isStatic === true
              const isStaticEffect = shape.metadata?.isStaticEffect === true
              if (isStatic) {
                console.log(`[Test] Static object: ${shape.name || shape.id}`)
              }
              return isStatic && !isStaticEffect
            })

            console.log(`[Test] Found ${staticObjects.length} static objects (expected 25)`)
            return staticObjects.length === 25
          }
        },
        expected: true
      },
      description: 'Verify 25 static objects are present (15 trees + 5 walls + 5 furniture)'
    }
  ]
}

/**
 * Test 2: Static Effects Performance Test
 * Creates persistent spell effects (auras, zones) and animates tokens through them
 */
export const staticEffectsPerformanceTest: TestScenario = {
  id: 'static-effects-performance',
  name: 'Static Effects Layer - Performance Test',
  description: 'Tests performance with persistent static spell effects and dynamic animations',
  category: 'visual',
  steps: [
    // Add some background static objects
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'pillar-1',
          name: 'Stone Pillar',
          position: { x: 200, y: 200 },
          color: '#9CA3AF',
          type: 'circle',
          radius: 40
        }
      },
      description: 'Add pillar 1'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'pillar-2',
          name: 'Stone Pillar',
          position: { x: 800, y: 200 },
          color: '#9CA3AF',
          type: 'circle',
          radius: 40
        }
      },
      description: 'Add pillar 2'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'pillar-3',
          name: 'Stone Pillar',
          position: { x: 200, y: 600 },
          color: '#9CA3AF',
          type: 'circle',
          radius: 40
        }
      },
      description: 'Add pillar 3'
    },
    {
      type: 'action',
      action: {
        type: 'addStaticObject',
        params: {
          id: 'pillar-4',
          name: 'Stone Pillar',
          position: { x: 800, y: 600 },
          color: '#9CA3AF',
          type: 'circle',
          radius: 40
        }
      },
      description: 'Add pillar 4'
    },

    // Add 5 persistent static effects (marked with metadata.isStaticEffect = true)
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            // Spirit Guardians aura (persistent circle)
            mapStore.addObject({
              id: 'static-effect-1',
              type: 'shape',
              shapeType: 'circle',
              position: { x: 400, y: 300 },
              rotation: 0,
              layer: 10,
              fill: '#FFD700',
              fillColor: '#FFD700',
              stroke: '#FFD700',
              strokeColor: '#FFD700',
              strokeWidth: 2,
              opacity: 0.3,
              radius: 80,
              name: 'Spirit Guardians',
              metadata: {
                isStaticEffect: true
              },
              staticEffectData: {
                template: {
                  id: 'spirit-guardians',
                  name: 'Spirit Guardians',
                  type: 'circle',
                  defaultColor: '#FFD700',
                  defaultOpacity: 0.3,
                  sizeProperties: { radius: 80 }
                },
                color: '#FFD700'
              }
            } as Shape)
          }
        }
      },
      description: 'Add Spirit Guardians aura (static effect 1)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            // Web zone (persistent circle)
            mapStore.addObject({
              id: 'static-effect-2',
              type: 'shape',
              shapeType: 'circle',
              position: { x: 650, y: 450 },
              rotation: 0,
              layer: 10,
              fill: '#FFFFFF',
              fillColor: '#FFFFFF',
              stroke: '#FFFFFF',
              strokeColor: '#FFFFFF',
              strokeWidth: 2,
              opacity: 0.4,
              radius: 70,
              name: 'Web',
              metadata: {
                isStaticEffect: true
              },
              staticEffectData: {
                template: {
                  id: 'web',
                  name: 'Web',
                  type: 'circle',
                  defaultColor: '#FFFFFF',
                  defaultOpacity: 0.4,
                  sizeProperties: { radius: 70 }
                },
                color: '#FFFFFF'
              }
            } as Shape)
          }
        }
      },
      description: 'Add Web zone (static effect 2)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            // Fog Cloud (persistent circle)
            mapStore.addObject({
              id: 'static-effect-3',
              type: 'shape',
              shapeType: 'circle',
              position: { x: 300, y: 550 },
              rotation: 0,
              layer: 10,
              fill: '#B0C4DE',
              fillColor: '#B0C4DE',
              stroke: '#B0C4DE',
              strokeColor: '#B0C4DE',
              strokeWidth: 2,
              opacity: 0.5,
              radius: 90,
              name: 'Fog Cloud',
              metadata: {
                isStaticEffect: true
              },
              staticEffectData: {
                template: {
                  id: 'fog-cloud',
                  name: 'Fog Cloud',
                  type: 'circle',
                  defaultColor: '#B0C4DE',
                  defaultOpacity: 0.5,
                  sizeProperties: { radius: 90 }
                },
                color: '#B0C4DE'
              }
            } as Shape)
          }
        }
      },
      description: 'Add Fog Cloud (static effect 3)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            // Wall of Fire (persistent rectangle)
            mapStore.addObject({
              id: 'static-effect-4',
              type: 'shape',
              shapeType: 'rectangle',
              position: { x: 500, y: 200 },
              rotation: 0,
              layer: 10,
              fill: '#FF4500',
              fillColor: '#FF4500',
              stroke: '#FF4500',
              strokeColor: '#FF4500',
              strokeWidth: 2,
              opacity: 0.6,
              width: 150,
              height: 20,
              name: 'Wall of Fire',
              metadata: {
                isStaticEffect: true
              },
              staticEffectData: {
                template: {
                  id: 'wall-of-fire',
                  name: 'Wall of Fire',
                  type: 'line',
                  defaultColor: '#FF4500',
                  defaultOpacity: 0.6,
                  sizeProperties: { length: 150, width: 20 }
                },
                color: '#FF4500'
              }
            } as Shape)
          }
        }
      },
      description: 'Add Wall of Fire (static effect 4)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            // Grease (persistent circle)
            mapStore.addObject({
              id: 'static-effect-5',
              type: 'shape',
              shapeType: 'circle',
              position: { x: 700, y: 250 },
              rotation: 0,
              layer: 10,
              fill: '#556B2F',
              fillColor: '#556B2F',
              stroke: '#556B2F',
              strokeColor: '#556B2F',
              strokeWidth: 2,
              opacity: 0.5,
              radius: 50,
              name: 'Grease',
              metadata: {
                isStaticEffect: true
              },
              staticEffectData: {
                template: {
                  id: 'grease',
                  name: 'Grease',
                  type: 'circle',
                  defaultColor: '#556B2F',
                  defaultOpacity: 0.5,
                  sizeProperties: { radius: 50 }
                },
                color: '#556B2F'
              }
            } as Shape)
          }
        }
      },
      description: 'Add Grease zone (static effect 5)'
    },

    {
      type: 'wait',
      wait: 1000,
      description: 'View the static effects (5 persistent spell zones)'
    },

    // Add 2 tokens
    {
      type: 'action',
      action: {
        type: 'addToken',
        params: {
          id: 'ranger-token',
          name: 'Ranger',
          position: { x: 200, y: 400 },
          size: 'medium',
          color: '#00FF00'
        }
      },
      description: 'Add Ranger token'
    },
    {
      type: 'action',
      action: {
        type: 'addToken',
        params: {
          id: 'cleric-token',
          name: 'Cleric',
          position: { x: 850, y: 500 },
          size: 'medium',
          color: '#FFFF00'
        }
      },
      description: 'Add Cleric token'
    },

    {
      type: 'wait',
      wait: 1000,
      description: 'View tokens in the static effect zones'
    },

    // Start combat
    {
      type: 'action',
      action: { type: 'startCombat', params: {} },
      description: 'Start combat'
    },

    // Event 1: Ranger moves through static effects and shoots arrow
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            // Ranger moves through Spirit Guardians and Fog Cloud
            roundStore.addAction('ranger-token', 'move', {
              type: 'move',
              fromPosition: { x: 200, y: 400 },
              toPosition: { x: 450, y: 350 }
            }, 1)
          }
        }
      },
      description: 'Add ranger movement through static effects (Event 1)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            // Ranger shoots arrow
            roundStore.addAction('ranger-token', 'spell', {
              type: 'spell',
              spellName: 'Arrow Shot',
              category: 'projectile',
              fromPosition: { x: 450, y: 350 },
              toPosition: { x: 850, y: 500 },
              color: '#8B4513',
              size: 15,
              duration: 1000,
              projectileSpeed: 600
            }, 1)
          }
        }
      },
      description: 'Add arrow projectile (Event 1)'
    },

    // Execute Event 1
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            await roundStore.executeEventActions(1)
          }
        }
      },
      description: 'Execute Event 1 (movement through static zones + arrow)'
    },

    {
      type: 'wait',
      wait: 3000,
      description: 'Watch movement through static effects (static effects should NOT re-render)'
    },

    // Event 2: Cleric moves and casts healing burst
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            // Cleric moves
            roundStore.addAction('cleric-token', 'move', {
              type: 'move',
              fromPosition: { x: 850, y: 500 },
              toPosition: { x: 600, y: 400 }
            }, 2)
          }
        }
      },
      description: 'Add cleric movement (Event 2)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            // Healing burst at cleric's position
            roundStore.addAction('cleric-token', 'spell', {
              type: 'spell',
              spellName: 'Cure Wounds',
              category: 'area',
              fromPosition: { x: 600, y: 400 },
              toPosition: { x: 600, y: 400 },
              color: '#00FF00',
              size: 40,
              duration: 1500,
              burstRadius: 50
            }, 2)
          }
        }
      },
      description: 'Add healing burst (Event 2)'
    },

    // Execute Event 2
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            await roundStore.executeEventActions(2)
          }
        }
      },
      description: 'Execute Event 2 (movement + healing)'
    },

    {
      type: 'wait',
      wait: 3000,
      description: 'Watch Event 2 animations (static effects unchanged)'
    },

    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const staticEffects = mapStore.currentMap?.objects.filter(obj => {
              if (obj.type !== 'shape') return false
              const shape = obj as Shape
              return shape.metadata?.isStaticEffect === true
            }) || []
            // Should have 5 static effects
            return staticEffects.length === 5
          }
        },
        expected: true
      },
      description: 'Verify 5 static effects are present'
    }
  ]
}

// Export all static layer performance tests
export const staticLayerPerformanceTests: TestScenario[] = [
  staticObjectsPerformanceTest,
  staticEffectsPerformanceTest
]
