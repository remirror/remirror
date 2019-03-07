import { EditorSchema } from '@remirror/core';
import { random, range, throttle } from 'lodash';
import { EditorView } from 'prosemirror-view';
import { MAX_PARTICLES, Particle, PARTICLE_NUM_RANGE, ParticleEffect } from './effects';

export interface EpicModePluginStateParams {
  particleEffect: ParticleEffect;
}

export class EpicModePluginState {
  public particleEffect: ParticleEffect;
  public getEditorWrapper: () => HTMLElement | undefined;
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;

  private shakeTime = 0;
  private shakeTimeMax = 0;
  private shakeIntensity = 5;
  private lastTime = 0;
  private particles: Particle[] = [];
  private isActive = false;
  private view!: EditorView<EditorSchema>;

  constructor({ particleEffect }: EpicModePluginStateParams) {
    this.particleEffect = particleEffect;
    const canvas = document.createElement('canvas');
    canvas.id = 'code-blast-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  /**
   * Store a reference to the view and add the canvas to the DOM
   *
   * @param view
   */
  public init(view: EditorView<EditorSchema>, container: HTMLElement) {
    this.view = view;
    container.appendChild(this.canvas);
    return this;
  }

  public destroy() {
    this.isActive = false;
    this.canvas.remove();
  }

  public shake = throttle((time: number) => {
    this.shakeTime = this.shakeTimeMax = time;
  }, 100);

  public spawnParticles = throttle(() => {
    const { selection } = this.view.state;
    const coords = this.view.coordsAtPos(selection.$anchor.pos);
    const node = document.elementFromPoint(coords.left - 5, coords.top + 5);
    if (!node) {
      console.log('no node found for coords: ', coords);
      return;
    }
    const numParticles = random(PARTICLE_NUM_RANGE.min, PARTICLE_NUM_RANGE.max);
    const color = getRGBComponents(node);
    let pointer = 0;
    range(numParticles).forEach(() => {
      this.particles[pointer] = this.particleEffect.createParticle(coords.left + 10, coords.top, color);
      pointer = (pointer + 1) % MAX_PARTICLES;
    });
  }, 100);

  /**
   * Runs through the animation loop
   */
  public loop() {
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
      const shakeX = random(-magnitude, magnitude);
      const shakeY = random(-magnitude, magnitude);
      (this.view.dom as HTMLElement).style.transform = `translate(${shakeX}px,${shakeY}px)`;
    }
    this.drawParticles();
    requestAnimationFrame(this.loop);
  }

  private drawParticles() {
    for (const particle of this.particles) {
      if (!particle || particle.alpha < 0.01 || particle.size <= 0.5) {
        continue;
      }

      this.particleEffect.updateParticle(particle, this.ctx);
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
