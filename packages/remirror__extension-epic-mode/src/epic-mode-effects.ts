import { randomInt } from '@remirror/core';

import type { ParticleEffect } from './epic-mode-types';

export const COLORS = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#bcbd22',
  '#17becf',
];

export const VIBRANT_COLORS = [
  '#0078ff',
  '#bd00ff',
  '#ff9a00',
  '#01ff1f',
  '#e3ff00',
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#bcbd22',
  '#17becf',
];

export const MAX_PARTICLES = 500;
export const PARTICLE_NUM_RANGE = { min: 5, max: 10 };
export const PARTICLE_GRAVITY = 0.08;
export const PARTICLE_ALPHA_FADEOUT = 0.96;
export const PARTICLE_VELOCITY_RANGE = {
  x: [-1, 1],
  y: [-3.5, -1.5],
} as const;

export const defaultEffect: ParticleEffect = {
  createParticle({ x, y, color }) {
    return {
      x,
      y: y + 10,
      alpha: 1,
      color,
      size: randomInt(2, 4),
      vx:
        PARTICLE_VELOCITY_RANGE.x[0] +
        Math.random() * (PARTICLE_VELOCITY_RANGE.x[1] - PARTICLE_VELOCITY_RANGE.x[0]),
      vy:
        PARTICLE_VELOCITY_RANGE.y[0] +
        Math.random() * (PARTICLE_VELOCITY_RANGE.y[1] - PARTICLE_VELOCITY_RANGE.y[0]),
    };
  },

  updateParticle({ particle, ctx }) {
    particle.vy += PARTICLE_GRAVITY;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.alpha *= PARTICLE_ALPHA_FADEOUT;

    ctx.fillStyle = `rgba(${particle.color[0]},${particle.color[1]},${particle.color[2]},${particle.alpha})`;
    ctx.fillRect(
      Math.round(particle.x - 1),
      Math.round(particle.y - 1),
      particle.size,
      particle.size,
    );
  },
};

const DEFAULT_SPAWNING_DRAG = 0.92;
const createSpawningTheta = () => (randomInt(0, 360) * Math.PI) / 180;

export const spawningEffect: ParticleEffect = {
  createParticle({ x, y, color }) {
    return {
      x,
      y: y + 10,
      alpha: 1,
      color,
      size: randomInt(2, 8),
      drag: DEFAULT_SPAWNING_DRAG,
      vx: randomInt(-3, 3),
      vy: randomInt(-3, 3),
      wander: 0.15,
      theta: createSpawningTheta(),
    };
  },
  updateParticle({ particle, ctx }) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= particle.drag ?? DEFAULT_SPAWNING_DRAG;
    particle.vy *= particle.drag ?? DEFAULT_SPAWNING_DRAG;
    particle.theta = (particle.theta ?? createSpawningTheta()) + randomInt(-0.5, 0.5);
    particle.vx += Math.sin(particle.theta) * 0.1;
    particle.vy += Math.cos(particle.theta) * 0.1;
    particle.size *= 0.96;

    ctx.fillStyle = `rgba(${particle.color[0]},${particle.color[1]},${particle.color[2]},${particle.alpha})`;
    ctx.beginPath();
    ctx.arc(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, 0, 2 * Math.PI);
    ctx.fill();
  },
};

// Borrowed from https://codepen.io/Guxthav/pen/EWdwEO
export const heartEffect: ParticleEffect = {
  createParticle({ x, y, color }) {
    return {
      x: x + 20,
      y: y - 10,
      alpha: 1,
      color,
      size: randomInt(5, 12),
      drag: 0.92,
      vx: randomInt(-3, 5),
      vy: randomInt(-3, 5),
      wander: 0.15,
      theta: (randomInt(0, 360) * Math.PI) / 180,
    };
  },

  updateParticle({ particle, ctx }) {
    particle.x += particle.vx / 2;
    particle.y += particle.vy / 2;
    particle.alpha *= 0.985;

    const baseLen = particle.size;

    ctx.save();

    // this moves origin 0,0 to our desired location
    ctx.translate(particle.x, particle.y);

    // optional: use context.rotate(0) to visualize
    // how we're drawing the heart using a square
    // and two half-circles
    ctx.rotate(3.95);

    // puts the 2d drawing context into drawing mode
    ctx.beginPath();
    ctx.moveTo(-baseLen, 0);
    ctx.arc(0, 0, baseLen, 0, Math.PI, false);
    ctx.lineTo(baseLen, 0);
    ctx.arc(baseLen, -baseLen, baseLen, (Math.PI * 90) / 180, (Math.PI * 270) / 180, true);
    ctx.lineTo(baseLen, -baseLen * 2);
    ctx.lineTo(-baseLen, -baseLen * 2);
    ctx.lineTo(-baseLen, 0);

    // Fill the heart
    const [r, g, b] = particle.color;
    ctx.fillStyle = `rgba(${r},${g},${b},${particle.alpha})`;
    ctx.fill();

    // tells 2d drawing context we're done drawing
    ctx.closePath();

    // restores canvas state (e.g. origin and other settings)
    ctx.restore();
  },
};
