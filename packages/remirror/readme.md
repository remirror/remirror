# remirror

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/remirror.svg?style=for-the-badge)](https://bundlephobia.com/result?p=remirror) [![npm](https://img.shields.io/npm/dm/remirror.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/remirror) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=packages%2Fremirror&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/remirror/package.json) [![NPM](https://img.shields.io/npm/l/remirror.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/package%3A%remirror.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Apackage%3A%remirror) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/package%3A%remirror.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3Apackage%3A%remirror)

Remirror is an extensible text-editor for react, built on top of Prosemirror. It aims to be **the** goto editor for a reliable editing experience across all JavaScript and user-facing environments.

The project is still in its early days and several of the ideas featured here still need to be fleshed out.

## Getting Started

### Prerequisites

- Typescript `>= 3.3` - Plans to use the latest `as const` syntax
- React `>= 16.8` - This project relies on hooks
- Yarn `>= 1.13` - It may work with previous versions as well

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

The above example uses hooks but you can just as easily rely on Higher Order Components (HOC's) to wrap your component.

In a similar fashion Higher Order Components (HOC's) can be used to wrap a component.

```ts
import { withRemirror } from 'remirror';

// ...

function SimpleMenu({ getPositionerProps }: InjectedRemirrorProps) {
  return <Menu {...getPositionerProps()} />;
}

export const WrappedSimpleMenu = withRemirror(SimpleMenu);
```
