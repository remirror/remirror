export type EpicModePluginStateParams = Required<EpicModeOptions>;

export interface ParticleRange {
  min: number;
  max: number;
}

export interface EpicModeOptions {
  /**
   * The particle effect to use
   */
  particleEffect?: ParticleEffect;

  /**
   * Where in the dom the canvas element should be stored
   */
  canvasHolder?: HTMLElement;

  /**
   * The colors for the epic effect
   */
  colors?: string[];

  /**
   * Range for the particles
   */
  particleRange?: ParticleRange;
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

export interface ParticleEffect {
  /**
   * Create a particle
   *
   * @param x x coordinate
   * @param y y coordinate
   * @param color suggested color of the particle
   * @param textColor color of the font currently being written
   */
  createParticle(x: number, y: number, color: string[] | number[], textColor: string[] | number[]): Particle;

  /**
   * Update the created particle (via mutation)
   *
   * @param particle
   * @param state
   */
  updateParticle(particle: Particle, ctx: CanvasRenderingContext2D): void;
}
