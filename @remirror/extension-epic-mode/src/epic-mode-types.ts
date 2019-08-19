import { BaseExtensionOptions } from '@remirror/core';

export type EpicModePluginStateParams = Required<Omit<EpicModeExtensionOptions, keyof BaseExtensionOptions>>;

export interface ParticleRange {
  min: number;
  max: number;
}

export interface EpicModeExtensionOptions extends BaseExtensionOptions {
  /**
   * The particle effect to use
   */
  particleEffect?: ParticleEffect;

  /**
   * Where in the dom the canvas element should be stored
   */
  getCanvasContainer?(): HTMLElement;

  /**
   * The colors for the epic effect
   */
  colors?: string[];

  /**
   * Range for the particles
   */
  particleRange?: ParticleRange;

  /**
   * Whether the editor should shake
   * @defaultValue true
   */
  shake?: boolean;

  /**
   * How long the shaking should last for
   * @defaultValue 0.3
   */
  shakeTime?: number;
}

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

export interface CreateParticleParams {
  /**
   * x coordinate
   */
  x: number;

  /**
   * y coordinate
   */
  y: number;

  /**
   * Suggested color of the particle
   */
  color: string[] | number[];

  /**
   * Current color of the font being typed
   */
  textColor: string[] | number[];

  /**
   * The ctx of the canvas
   */
  ctx: CanvasRenderingContext2D;

  /**
   * The canvas element
   */
  canvas: HTMLCanvasElement;
}

export interface UpdateParticleParams {
  particle: Particle;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
}

export interface ParticleEffect {
  /**
   * Create a particle
   *
   * @param params
   */
  createParticle(params: CreateParticleParams): Particle;

  /**
   * Update the created particle (via mutation)
   *
   * @param params
   */
  updateParticle(params: UpdateParticleParams): void;
}
