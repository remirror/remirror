# test-keyboard

[![npm](https://img.shields.io/npm/dm/test-keyboard.svg?&logo=npm)](https://www.npmjs.com/package/test-keyboard)

A test keyboard for dispatching events to the dom which mimics keyboard actions from the user.

## The problem

You want to write tests for code that makes heavy usage of the keyboard and you're finding it hard to compose these keyboard events together.

## This solution

`test-keyboard` is an elegant way of composing keyboard events together as if a user was typing.

It is primarily designed for dom-test environments but could be extracted out into something that can be used in your front-end code.

## Installation

```bash
yarn add test-keyboard
```

## `Keyboard.create` - `(params: KeyboardConstructorParams) => Keyboard`

```ts
import { Keyboard } from 'test-keyboard';

const target = document.getElementById('editor');
Keyboard.create({
    target,
  })
    .start() // Allows events to be dispatched
    .mod({ text: 'Ctrl-Shift-Enter' })
    .end(); // Dispatches al the events.
};
```

### `KeyboardConstructorParams`

| **Property**      |             **Type**             | **Default**  | **Description**                                                                |
| ----------------- | :------------------------------: | :----------: | ------------------------------------------------------------------------------ |
| `target`          |            `Element`             | **REQUIRED** | The target of our events.                                                      |
| `defaultOptions`  |       `KeyboardEventInit`        |     `{}`     | The target of our events.                                                      |
| `isMac`           |            `boolean`             |   `false`    | Whether to simulate a mac.                                                     |
| `batch`           |            `boolean`             |   `false`    | Whether to wait until end is called before running all accumulated actions.    |
| `onEventDispatch` | `(event: KeyboardEvent) => void` |  `() => {}`  | Called whenever an event is dispatched with the keyboard event as a parameter. |

## Acknowledgements

- [Puppeteer](https://github.com/GoogleChrome/puppeteer) for providing the _US Keyboard_ information.
