import type { Shape } from '@remirror/core';

export class EventEmitter<T> {
  constructor(private readonly target: HTMLElement, private readonly eventName: string) {}

  emit(value: T, options?: Shape): void {
    this.target.dispatchEvent(new CustomEvent<T>(this.eventName, { detail: value, ...options }));
  }
}

export function event() {
  return (protoOrDescriptor: Shape, name: string): any => {
    const descriptor = {
      get(this: HTMLElement) {
        return new EventEmitter(this, name !== undefined ? name : protoOrDescriptor.key);
      },
      enumerable: true,
      configurable: true,
    };

    if (name !== undefined) {
      // legacy TS decorator
      return Object.defineProperty(protoOrDescriptor, name, descriptor);
    }

    // TC39 Decorators proposal
    return {
      kind: 'method',
      placement: 'prototype',
      key: protoOrDescriptor.key,
      descriptor,
    };
  };
}
