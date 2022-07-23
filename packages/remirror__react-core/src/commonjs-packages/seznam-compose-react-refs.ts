import _composeRefs from '@seznam/compose-react-refs';

type ComposeRefs = typeof _composeRefs;

const composeRefs: ComposeRefs =
  typeof _composeRefs === 'object' &&
  (_composeRefs as any).__esModule &&
  (_composeRefs as any).default
    ? (_composeRefs as any).default
    : _composeRefs;

export { composeRefs };
