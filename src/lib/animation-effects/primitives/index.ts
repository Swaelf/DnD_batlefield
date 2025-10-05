/**
 * Animation primitives barrel export
 *
 * Exports all animation primitives (motion + effects):
 * - Motion primitives: Move, Rotate, Scale, Color, Fade
 * - Effect primitives: Trail, Glow, Pulse, Flash, Particles
 */

// Motion primitives
export { Move } from './motion/Move';
export { Rotate } from './motion/Rotate';
export { Scale } from './motion/Scale';
export { Color } from './motion/Color';
export { Fade, createFadeIn, createFadeOut, createFadeTo } from './motion/Fade';

// Effect primitives
export { Trail } from './effects/Trail';
export { Glow } from './effects/Glow';
export { Pulse } from './effects/Pulse';
export { Flash } from './effects/Flash';
export { Particles } from './effects/Particles';
