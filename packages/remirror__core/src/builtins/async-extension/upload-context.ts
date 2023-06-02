import { createNanoEvents } from 'nanoevents';

export interface UploadContext {
  // Sets a key-value pair in the context.
  set: (key: string, value: unknown) => void;

  // Gets a value from the context. Returns undefined if the value is not set.
  get: (key: string) => unknown;

  // Add a listener when a key is set. Returns a function that removes the listener.
  // The listener will be called with an object with all the keys and values.
  addListener: (listener: UploadContextListener) => () => void;
}

type UploadContextListener = (values: Record<string, unknown>) => void;

interface UploadContextEvents {
  set: UploadContextListener;
}

export function createUploadContext(): UploadContext {
  const values: Record<string, unknown> = {};
  const emitter = createNanoEvents<UploadContextEvents>();

  const get = (key: string): unknown => {
    return values[key];
  };

  const set = (key: string, value: unknown) => {
    values[key] = value;
    emitter.emit('set', values);
  };

  const addListener = (listener: UploadContextListener) => {
    return emitter.on('set', listener);
  };

  return { set, get, addListener };
}
