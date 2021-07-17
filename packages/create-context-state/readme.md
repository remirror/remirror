# create-context-state

> Manage your react state with a simple context hook creator.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/create-context-state
[npm]: https://npmjs.com/package/create-context-state
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=create-context-state
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/create-context-state
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/create-context-state/red?icon=npm

<br />

## Installation

```bash
# yarn
yarn add create-context-state

# pnpm
pnpm add create-context-state

# npm
npm install create-context-state
```

<br />

## Usage

Create a context and provider with built in setters and getters.

```tsx
import { createContextState } from 'create-context-state';

const [CountProvider, useCount] = createContextState(({ set, get }) => ({
  defaultValue: 0,
  value: 0,
  increment: () => set((state) => ({ value: state.value + 1 })),
  decrement: () => set((state) => ({ value: state.value - 1 })),
  reset: () => get('value') !== get('defaultValue'),
}));

const App = () => {
  return (
    <CountProvider>
      <Counter />
    </CountProvider>
  );
};

const Counter = () => {
  const { value, increment, decrement, reset } = useCount();

  return (
    <>
      <span>{value}</span>
      <button onClick={() => increment()}>+</button>
      <button onClick={() => decrement()}>-</button>
      <button onClick={() => reset()}>reset</button>
    </>
  );
};
```
