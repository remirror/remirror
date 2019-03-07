import { random } from 'lodash';

export const MAX_PARTICLES = 500;
export const PARTICLE_NUM_RANGE = { min: 5, max: 10 };
export const PARTICLE_GRAVITY = 0.08;
export const PARTICLE_ALPHA_FADEOUT = 0.96;
export const PARTICLE_VELOCITY_RANGE = {
  x: [-1, 1],
  y: [-3.5, -1.5],
};

export interface Particle {
  x: number;
  y: number;
  alpha: number;
  color: string[] | number[];
  size: number;
  vx: number;
  vy: number;
  drag?: number;
  wander?: number;
  theta?: number;
}

export interface ParticleEffect {
  /**
   * Create a particle
   *
   * @param x x coordinate
   * @param y y coordinate
   * @param color color of particle
   */
  createParticle(x: number, y: number, color: string[] | number[]): Particle;

  /**
   * Update the created particle (via mutation)
   *
   * @param particle
   * @param state
   */
  updateParticle(particle: Particle, ctx: CanvasRenderingContext2D): void;
}

export const defaultEffect: ParticleEffect = {
  createParticle(x, y, color) {
    return {
      x,
      y: y + 10,
      alpha: 1,
      color,
      size: random(2, 4),
      vx:
        PARTICLE_VELOCITY_RANGE.x[0] +
        Math.random() * (PARTICLE_VELOCITY_RANGE.x[1] - PARTICLE_VELOCITY_RANGE.x[0]),
      vy:
        PARTICLE_VELOCITY_RANGE.y[0] +
        Math.random() * (PARTICLE_VELOCITY_RANGE.y[1] - PARTICLE_VELOCITY_RANGE.y[0]),
    };
  },

  updateParticle(particle, ctx) {
    particle.vy += PARTICLE_GRAVITY;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.alpha *= PARTICLE_ALPHA_FADEOUT;

    ctx.fillStyle = `rgba(${particle.color[0]},${particle.color[1]},${particle.color[2]},${particle.alpha})`;
    ctx.fillRect(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, particle.size);
  },
};

export const spawningEffect: ParticleEffect = {
  createParticle(x, y, color) {
    return {
      x,
      y: y + 10,
      alpha: 1,
      color,
      size: random(2, 8),
      drag: 0.92,
      vx: random(-3, 3),
      vy: random(-3, 3),
      wander: 0.15,
      theta: (random(0, 360) * Math.PI) / 180,
    };
  },
  updateParticle(particle, ctx) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= particle.drag!;
    particle.vy *= particle.drag!;
    particle.theta! += random(-0.5, 0.5);
    particle.vx += Math.sin(particle.theta!) * 0.1;
    particle.vy += Math.cos(particle.theta!) * 0.1;
    particle.size *= 0.96;

    ctx.fillStyle = `rgba(${particle.color[0]},${particle.color[1]},${particle.color[2]},${particle.alpha})`;
    ctx.beginPath();
    ctx.arc(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, 0, 2 * Math.PI);
    ctx.fill();
  },
};
