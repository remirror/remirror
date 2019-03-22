<div align="center">
	<br />
	<div align="center">
		<img width="300" src="https://cdn.jsdelivr.net/gh/ifiokjr/remirror/support/assets/logo-icon.svg" alt="remirror" />
    <h1 align="center">remirror</h1>
	</div>
    <br />
    <br />
    <br />
    <br />
</div>

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/remirror.svg?style=for-the-badge)](https://bundlephobia.com/result?p=remirror) [![npm](https://img.shields.io/npm/dm/remirror.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/remirror) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=packages%2Fremirror&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/remirror/package.json) [![NPM](https://img.shields.io/npm/l/remirror.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/package%3A%remirror.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Apackage%3A%remirror) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/package%3A%remirror.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3Apackage%3A%remirror)

Remirror is an extensible text-editor for react, built on top of Prosemirror. It aims to be **the** goto editor for a reliable editing experience across all JavaScript and user-facing environments.

The project is still in its early days and several of the ideas featured here still need to be fleshed out.

## Installation

```bash
yarn add remirror
```

## Usage

```ts
import { Remirror } from 'remirror';

const Editor = props => (
  <Remirror
    onChange={onChange}
    placeholder='This is a placeholder'
    autoFocus={true}
    initialContent={initialJson}
  >
    {({ getPositionerProps, actions }) => {
      const menuProps = getPositionerProps({
        name: 'floating-menu',
      });
      return (
        <div>
          <div
            style={{
              position: 'absolute',
              top: menuProps.position.top,
              left: menuProps.position.left,
            }}
            ref={menuProps.ref}
          >
            <button
              style={{
                backgroundColor: actions.bold.isActive() ? 'white' : 'pink',
                fontWeight: actions.bold.isActive() ? 600 : 300,
              }}
              disabled={!actions.bold.isEnabled()}
              onClick={runAction(actions.bold.run)}
            >
              B
            </button>
          </div>
        </div>
      );
    }}
  </Remirror>
);
```
