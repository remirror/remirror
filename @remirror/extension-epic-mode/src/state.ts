import { SchemaParams } from '@remirror/core';
import { throttle } from 'lodash';
import { ParticleEffect } from './effects';

export interface EpicModePluginStateParams {
  particleEffect: ParticleEffect;
  getEditorWrapper: SchemaParams['getEditorWrapper'];
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
  private particles = [];
  private particlePointer = 0;
  private effect: number;
  private isActive = false;

  constructor({ particleEffect, getEditorWrapper }: EpicModePluginStateParams) {
    this.particleEffect = particleEffect;
    this.getEditorWrapper = getEditorWrapper;
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

  private shake = throttle((time: number) => {
    this.shakeTime = this.shakeTimeMax = time;
  }, 100);

  private spawnParticles = throttle(() => {}, 100);
}
