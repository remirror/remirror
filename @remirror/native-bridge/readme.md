<div align="center">
	<br />
	<div align="center">
		<img width="300" src="https://cdn.jsdelivr.net/gh/ifiokjr/remirror/support/assets/logo-icon.svg" alt="remirror" />
    <h1 align="center">native-bridge</h1>
	</div>
    <br />
    <br />
    <br />
    <br />
</div>

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/native-bridge.svg?style=for-the-badge)](https://bundlephobia.com/result?p=@remirror/native-bridge) [![npm](https://img.shields.io/npm/dm/@remirror/native-bridge.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@remirror/native-bridge) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=@remirror%2Fnative-bridge&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/@remirror/native-bridge/package.json) [![NPM](https://img.shields.io/npm/l/@remirror/native-bridge.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/@remirror/native-bridge.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fnative-bridge) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/@remirror/native-bridge.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fnative-bridge)

## Installation

```bash
yarn add @remirror/native-bridge
```

Articles:
Prerender the content https://www.freecodecamp.org/news/server-side-rendering-your-react-app-in-three-simple-steps-7a82b95db82e/

The native bridge extension allows for communication between expo/react-native and your remirror editor.

- First example Make text bold.
- Packages
- @remirror/react-native (provides the webview and means to prerender the injected html)

The editor sits within a webview
The Bold button sits within the native view.
User presses bold.
the onclick handler for bold fires
the native view calls a global method within the webview (using injectJavaScript) called remirrorNativeBridge
it sends through a json object
{ type: 'C' }
