---
hide_title: true
title: Errors
---

# Errors

This page contains the documented errors that occur while using `remirror`. Currently the descriptions are very short and if you'd like to contribute to make them more comprehensive, then that would be very much appreciated. Edit this page to get started.

<br />

## Core

<br />

### RMR0000

> Production Error

An error occurred in production and details are intentionally being hidden.

### RMR0001

> Unknown Error

Sooo, this is embarassing. Something happened and we're not quite sure why. Your best course of action is to open an [issue](https://github.com/remirror/remirror/issues/new?template=bug_report.md) explaining what you're seeing.

### RMR0002

> Invalid Command Arguments

The arguments passed to the command method were invalid. Check how you're calling all commands made available by the editor and make sure arguments are correct.

### RMR0003

> Custom Error

This is a custom error possibly thrown by an external library. It's almost as hard to diagnose as the `Unknown Error`.

### RMR0004

> Core Helpers

An error occurred in a function called from the `@remirror/core-helpers` library.

### RMR0005

> Mutation

You have attempted to change a value that shouldn't be changed.

### RMR0006

> Internal

This is an error which should not occur and is internal to the remirror codebase.

### RMR0007

> Missing Required Extension

You're editor is missing a required extension.

### RMR0008

> Manager Phase Error

Called a method event at the wrong time. Please make sure getter functions are only called with within the scope of the returned functions. They should not be called in the outer scope of your method.

### RMR0009

> New Editor Manager

No directly invoking the editor manager with `new`. Instead use one of the static methods to create your instance.

### RMR0010

> Invalid Get Extension

The user requested an invalid extension from the getExtensions method. Please check the `createExtensions` return method is returning an extension with the defined constructor.

### RMR0011

> Invalid Manager Arguments

Invalid value passed into `Manager constructor`. Only `Presets` and `Extensions` are supported.

### RMR0012

> Schema

There is a problem with the schema or you are trying to access a node / mark that doesn't exists.

This typically means that you're trying to access a mark or node that hasn't been added to the schema. Check that all required extensions have been added to your editor and that you haven't string referenced a type unintentionally.

### RMR0013

> Helpers Called In Outer Scope

The `helpers` method which is passed into the ``create\*` method should only be called within returned method since it relies on an active view (not present in the outer scope).

### RMR0014

> Invalid Manager Extension

The user requested an invalid extension from the manager.

### RMR0015

> Invalid Manager Preset

The user requested an invalid preset from the manager.

### RMR0016

> Duplicate Command Names

Command method names must be unique within the editor.

### RMR0017

> Duplicate Helper Names

Helper method names must be unique within the editor.

### RMR0018

> Non Chainable Command

Attempted to chain a non chainable command.

### RMR0019

> Invalid Extension

The provided extension is invalid.

### RMR0020

> Invalid Preset

The provided preset is invalid.

### RMR0050

> Invalid Name

An invalid name was used for the extension.

### RMR0100

> Extension

An error occurred within an extension.

### RMR0101

> Extension Spec

The spec was defined without calling the `defaults`, `parse` or `dom` methods.

### RMR0102

> Extension Extra Attributes

Extra attributes must either be a string or an object.

### RMR0103

> Invalid Set Extension Options

A call to `extension.setOptions()` was made with invalid keys.

<br />

## React

<br />

### RMR0200

> React Provider Context

**`useRemirrorContext` was called outside of the remirror context. It can only be used within an active remirror context created by the `<Remirror />` component.**

### RMR0201

> React Get Root Props

`getRootProps` has been attached to the DOM more than once. It should only be attached to the DOM **once** per editor.

This error happens because the `getRootProps` method is being used in a component that is rendered multiple times without updates from the react provider. The `getRootProps` method is responsible for collecting obtaining the HTMLElement via the `ref` prop and appending the prosemirror text editor to it. If that's done multiple times per render then it has problems.

To fix this you should move the component calling `getRootProps` to a part of the tree that is only rerendered when the `Remirror` component is updated.

For example the following would trigger this error.

```tsx
import React from 'react';
import { BoldExtension, CorePreset } from 'remirror/extensions';
import { Remirror, useRemirror, useRemirrorContext } from '@remirror/react';

const Editor = () => {
  const [boldActive] = useState(false);

  const { getRootProps, commands } = useRemirrorContext({ autoUpdate: true });

  return (
    <div>
      <button
        onClick={() => commands.toggleBold()}
        style={{ fontWeight: activeCommands.bold ? 'bold' : undefined }}
      >
        B
      </button>
      <div {...getRootProps()} />
    </div>
  );
};

const EditorWrapper = () => {
  const manager = useRemirror([new CorePreset(), new BoldExtension()]);

  return (
    <Remirror manager={manager}>
      <Editor />
    </Remirror>
  );
};
```

The onChange handler being passed into the `useRemirrorContext` hook means that every time the editor content changes there will be a `setBoldActive` called which re-renders the `Internal` component. As a result `getRootProps` is called multiple times.

To fix this issue you need to move the getRootProps to a part of the tree that only updates when the `Remirror` updates. There are several ways to do this and one of them is to split up the `Internal` component into two seperate components.

The fixed code could look something like this.

```tsx
import React from 'react';
import { Remirror } from '@remirror/react';

const Menu = () => {
  const { commands, active } = useRemirrorContext({ autoUpdate: true });

  return (
    <>
      <button
        onClick={() => commands.toggleBold()}
        style={{ fontWeight: active.bold() ? 'bold' : undefined }}
      >
        B
      </button>
    </>
  );
};

const TextEditor = () => {
  const { getRootProps } = useRemirrorContext();

  return <div {...getRootProps()} />;
};

const EditorWrapper = () => {
  const manager = useRemirror([new CorePreset(), new BoldExtension()]);

  return (
    <Remirror manager={manager}>
      <div>
        <Menu />
        <TextEditor />
      </div>
    </Remirror>
  );
};
```

Now the `TextEditor` component is only updated when the `Remirror` is updated.

### RMR0202

> React Editor View

A problem occurred adding the editor view to the dom.

### RMR0203

> React Controlled

There is a problem with your controlled editor setup.

### RMR0204

> React Node View

Something went wrong with your custom ReactNodeView Component.

<br />

### RMR0205

> React Components

An error occurred within a remirror component.

<br />

### RMR0206

> React Hooks

An error occurred within a remirror hook.

<br />

## Other

<br />

### RMR0300

> I18N Context

There is something wrong with your i18n setup.

## Build Errors

### `make-plural/plurals`

> Attempted import error: 'en' is not exported from 'make-plural/plurals'.

There is a problem related to Webpack (4 & 5) build configuration. Make sure:

- `file-loader` does not process `.mjs` files, e.g.:

  ```
  // "file" loader makes sure assets end up in the `build` folder.
  // When you `import` an asset, you get its filename.
  // This loader doesn't use a "test" so it will catch all modules
  // that fall through the other loaders.
  {
    loader: require.resolve('file-loader'),

    // Exclude `js` files to keep "css" loader working as it injects
    // it's runtime that would otherwise processed through "file" loader.
    // Also exclude `html` and `json` extensions so they get processed
    // by webpacks internal loaders.
    exclude: [/\.js$/, /\.mjs$/, /\.html$/, /\.json$/],
    options: {
      name: 'static/media/[name].[hash:8].[ext]'
    }
  }
  ```

- instead these files must be processed for example with `babel-loader`, e.g.

  ```
  // Process JS with Babel.
  {
    test: /\.(js|jsx|mjs)$/,
    include: paths.appSrc,
    exclude: /node_modules/,
    loader: require.resolve('babel-loader'),
    options: {
      compact: true
    }
  },
  ```
