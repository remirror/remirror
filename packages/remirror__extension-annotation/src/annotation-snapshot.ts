import type { State } from 'fast-copy';
import { createCopier } from 'fast-copy';
import { createCustomEqual } from 'fast-equals';

// Errors, like functions and weak collections, retain their reference in the
// snapshot. Compare them by identity instead of inspecting mutable internals.
export const equalAnnotations = createCustomEqual({
  circular: true,
  strict: true,
  createCustomConfig: () => ({ areErrorsEqual: (first, second) => first === second }),
});

/**
 * Copy the comparison data, not the annotations returned to the caller. The
 * default Map copier retains keys, which would hide in-place edits from the
 * cache. DataView snapshots must also retain their original window.
 */
export const snapshotAnnotations = createCopier({
  strict: true,
  methods: {
    dataView(value, state) {
      const result = new state.Constructor(
        state.copier(value.buffer, state),
        value.byteOffset,
        value.byteLength,
      );
      state.cache.set(value, result);
      copyOwnProperties(value, result, state);
      return result;
    },
    map(value, state) {
      const result = new state.Constructor();
      state.cache.set(value, result);

      for (const [key, item] of value) {
        result.set(state.copier(key, state), state.copier(item, state));
      }

      copyOwnProperties(value, result, state);
      return result;
    },
  },
});

function copyOwnProperties(source: object, target: object, state: State): void {
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);

    if (!descriptor) {
      continue;
    }

    if ('value' in descriptor) {
      descriptor.value = state.copier(descriptor.value, state);
    }

    Object.defineProperty(target, key, descriptor);
  }
}
