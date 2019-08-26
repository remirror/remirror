import { EditorView, randomInt, throttle } from '@remirror/core';
import { EpicModePluginStateParams, Particle, ParticleEffect, ParticleRange } from './epic-mode-types';

export class EpicModePluginState {
  private particleEffect: ParticleEffect;
  private particleRange: ParticleRange;
  private getCanvasContainer: () => HTMLElement;
  private container!: HTMLElement;
  private shakeActive: boolean;
  private colors: string[];
  private shakeTime = 0;
  private shakeTimeMax = 0;
  private shakeIntensity = 5;
  private lastTime = 0;
  private particles: Particle[] = [];
  private isActive = false;
  private view!: EditorView;

  public canvas!: HTMLCanvasElement;
  public ctx!: CanvasRenderingContext2D;

  constructor({
    particleEffect,
    colors,
    particleRange,
    getCanvasContainer,
    shake,
  }: EpicModePluginStateParams) {
    this.particleEffect = particleEffect;
    this.particleRange = particleRange;
    this.shakeActive = shake;
    this.colors = colors;
    this.getCanvasContainer = getCanvasContainer;
  }

  /**
   * Store a reference to the Prosemirror view and add the canvas to the DOM
   *
   * @param view
   */
  public init(view: EditorView) {
    this.view = view;
    this.container = this.getCanvasContainer ? this.getCanvasContainer() : document.body;

    const canvas = document.createElement('canvas');
    canvas.id = 'epic-mode-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.container.appendChild(this.canvas);

    this.isActive = true;
    this.loop();

    return this;
  }

  public destroy() {
    // Wrapped in try catch for support of hot module reloading during development
    try {
      this.isActive = false;
      this.canvas.remove();
      if (this.container.contains(this.canvas)) {
        this.container.removeChild(this.canvas);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  public shake = throttle(100, (time: number) => {
    if (this.shakeActive) {
      this.shakeTime = this.shakeTimeMax = time;
    }
  });

  public spawnParticles = throttle(100, () => {
    const { selection } = this.view.state;
    const coords = this.view.coordsAtPos(selection.$anchor.pos);

    // Move the canvas
    this.canvas.style.top = `${window.scrollY}px`;
    this.canvas.style.left = `${window.scrollX}px`;

    const node = document.elementFromPoint(coords.left - 5, coords.top + 5);
    if (!node) {
      return;
    }

    const numParticles = randomInt(this.particleRange.min, this.particleRange.max);
    const textColor = getRGBComponents(node);
    for (let ii = 0; ii < numParticles; ii++) {
      const colorCode = this.colors[ii % this.colors.length];
      const r = parseInt(colorCode.slice(1, 3), 16);
      const g = parseInt(colorCode.slice(3, 5), 16);
      const b = parseInt(colorCode.slice(5, 7), 16);
      const color = [r, g, b];

      this.particles[ii] = this.particleEffect.createParticle({
        x: coords.left + 10,
        y: coords.top - 10,
        color,
        textColor,
        ctx: this.ctx,
        canvas: this.canvas,
      });
    }
  });

  /**
   * Runs through the animation loop
   */
  public loop = () => {
    if (!this.isActive) {
      return;
    }

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // get the time past the previous frame
    const currentTime = new Date().getTime();
    if (!this.lastTime) {
      this.lastTime = currentTime;
    }
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const magnitude = (this.shakeTime / this.shakeTimeMax) * this.shakeIntensity;
      const shakeX = randomInt(-magnitude, magnitude);
      const shakeY = randomInt(-magnitude, magnitude);
      (this.view.dom as HTMLElement).style.transform = `translate(${shakeX}px,${shakeY}px)`;
    }
    this.drawParticles();
    requestAnimationFrame(this.loop);
  };

  private drawParticles() {
    for (const particle of this.particles) {
      if (!particle || particle.alpha < 0.01 || particle.size <= 0.5) {
        continue;
      }

      this.particleEffect.updateParticle({ particle, ctx: this.ctx, canvas: this.canvas });
    }
  }
}

function getRGBComponents(node: Element) {
  const color = getComputedStyle(node).color;
  let match: RegExpMatchArray | null;
  // tslint:disable-next-line:no-conditional-assignment
  if (color && (match = color.match(/(\d+), (\d+), (\d+)/))) {
    try {
      return match.slice(1);
    } catch {
      return [255, 255, 255];
    }
  } else {
    return [255, 255, 255];
  }
}
