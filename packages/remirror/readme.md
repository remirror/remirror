# remirror

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/remirror.svg?)](https://bundlephobia.com/result?p=remirror) [![npm](https://img.shields.io/npm/dm/remirror.svg?&logo=npm)](https://www.npmjs.com/package/remirror)

Remirror is an extensible text-editor for react, built on top of Prosemirror.

## Getting Started

### Prerequisites

- Typescript `>= 3.6`
- React `>= 16.9`
- Yarn `>= 1.17`

## Installation

```bash
yarn add remirror
```

The following is a small example which renders a floating menu and enables the extensions `Bold`, `Italic` and `Underline`.

```ts
import React, { FC, FunctionComponent, MouseEventHandler, useState } from 'react';

import {
  EMPTY_PARAGRAPH_NODE,
  Bold,
  Italic,
  Underline,
  bubblePositioner,
  ManagedRemirrorProvider,
  RemirrorEventListener,
  RemirrorExtension,
  RemirrorManager,
  RemirrorProps,
  useRemirrorContext,
} from 'remirror';

const runAction = (action: () => void): MouseEventHandler<HTMLElement> => e => {
  e.preventDefault();
  action();
};

const SimpleFloatingMenu: FC = () => {
  const { getPositionerProps, actions } = useRemirrorContext(); // Pull in injected props from context

  const props = getPositionerProps({
    positionerId: 'bubble',
    ...bubblePositioner,
  });
  return (
    <div
      style={{
        position: 'absolute',
        bottom: props.isActive ? props.bottom : -9999,
        left: props.isActive ? props.left : -9999,
      }}
      ref={props.ref}
    >
      <button
        style={{
          backgroundColor: actions.bold.isActive() ? 'white' : 'pink',
          fontWeight: actions.bold.isActive() ? 600 : 300,
        }}
        disabled={!actions.bold.isEnabled()}
        onClick={runAction(actions.bold.command)}
      >
        b
      </button>
      <button
        style={{
          backgroundColor: actions.italic.isActive() ? 'white' : 'pink',
          fontWeight: actions.italic.isActive() ? 600 : 300,
        }}
        disabled={!actions.italic.isEnabled()}
        onClick={runAction(actions.italic.command)}
      >
        i
      </button>
      <button
        style={{
          backgroundColor: actions.underline.isActive() ? 'white' : 'pink',
          fontWeight: actions.underline.isActive() ? 600 : 300,
        }}
        disabled={!actions.underline.isEnabled()}
        onClick={runAction(actions.underline.command)}
      >
        u
      </button>
    </div>
  );
};

const EditorLayout: FunctionComponent = () => {
  return (
    <RemirrorManager>
      <RemirrorExtension Constructor={Bold} />
      <RemirrorExtension Constructor={Italic} />
      <RemirrorExtension Constructor={Underline} />
      <ManagedRemirrorProvider
        attributes={{ 'data-testid': 'editor-instance' }}
        onChange={onChange}
        placeholder='Start typing for magic...'
        autoFocus={true}
        initialContent={EMPTY_PARAGRAPH_NODE}
      >
        <SimpleFloatingMenu />
      </ManagedRemirrorProvider>
    </RemirrorManager>
  );
};
```
