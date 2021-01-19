export type EpicModePluginStateProps = Required<EpicModeOptions>;

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
  getCanvasContainer?: () => HTMLElement;

  /**
   * The colors for the epic effect
   */
  colors?: string[];

  /**
   * Range for the particles
   */
  particleRange?: ParticleRange;

  /**
   * Whether epic mode is active.
   *
   * @default true
   */
  active?: boolean;

  /**
   * How long the shaking should last for.
   *
   * @default 0.3
   */
  shakeTime?: number;

  /**
   * How strong should the intensity of the shaking be.
   *
   * @default 5
   */
  shakeIntensity?: number;
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

export interface CreateParticleProps {
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

export interface UpdateParticleProps {
  particle: Particle;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
}

export interface ParticleEffect {
  /**
   * Create a particle
   *
   * @param props
   */
  createParticle: (props: CreateParticleProps) => Particle;

  /**
   * Update the created particle (via mutation)
   *
   * @param props
   */
  updateParticle: (props: UpdateParticleProps) => void;
}
