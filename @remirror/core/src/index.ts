// TODO remove these exports
export * from '@remirror/core-constants';
export * from '@remirror/core-utils';
export * from '@remirror/core-types';
export * from '@remirror/core-helpers';

export * from './builtins';
export * from './extension';
export * from './editor-manager';
export * from './preset';
export * from './types';

// TODO move to a new package.
export * from './commands';

export type {
  BaseClass,
  BaseClassConstructor,
  AddHandler,
  SetCustomOption,
} from './extension/base-class';
