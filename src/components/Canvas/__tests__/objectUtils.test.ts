import { describe, it, expect } from 'vitest'
import { isToken, isShape, isText, isSpell, isAttack, isPersistentArea } from '../objectUtils'
import type { MapObject } from '@/types'

describe('objectUtils', () => {
  describe('isToken', () => {
    it('should return true for token objects', () => {
      const token: MapObject = {
        id: 'token-1',
        type: 'token',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isToken(token)).toBe(true)
    })

    it('should return false for non-token objects', () => {
      const shape: MapObject = {
        id: 'shape-1',
        type: 'shape',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isToken(shape)).toBe(false)
    })
  })

  describe('isShape', () => {
    it('should return true for shape objects', () => {
      const shape: MapObject = {
        id: 'shape-1',
        type: 'shape',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isShape(shape)).toBe(true)
    })

    it('should return false for non-shape objects', () => {
      const token: MapObject = {
        id: 'token-1',
        type: 'token',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isShape(token)).toBe(false)
    })
  })

  describe('isText', () => {
    it('should return true for text objects', () => {
      const text: MapObject = {
        id: 'text-1',
        type: 'text',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isText(text)).toBe(true)
    })

    it('should return false for non-text objects', () => {
      const token: MapObject = {
        id: 'token-1',
        type: 'token',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isText(token)).toBe(false)
    })
  })

  describe('isSpell', () => {
    it('should return true for spell objects', () => {
      const spell: MapObject = {
        id: 'spell-1',
        type: 'spell',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isSpell(spell)).toBe(true)
    })

    it('should return false for non-spell objects', () => {
      const token: MapObject = {
        id: 'token-1',
        type: 'token',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isSpell(token)).toBe(false)
    })
  })

  describe('isAttack', () => {
    it('should return true for attack objects', () => {
      const attack: MapObject = {
        id: 'attack-1',
        type: 'attack',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isAttack(attack)).toBe(true)
    })

    it('should return false for non-attack objects', () => {
      const token: MapObject = {
        id: 'token-1',
        type: 'token',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isAttack(token)).toBe(false)
    })
  })

  describe('isPersistentArea', () => {
    it('should return true for persistent-area objects', () => {
      const area: MapObject = {
        id: 'area-1',
        type: 'persistent-area',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isPersistentArea(area)).toBe(true)
    })

    it('should return false for non-persistent-area objects', () => {
      const token: MapObject = {
        id: 'token-1',
        type: 'token',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1
      }
      expect(isPersistentArea(token)).toBe(false)
    })
  })
})
