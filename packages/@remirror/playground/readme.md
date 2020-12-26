# @remirror/playground

> A playground to get you quickly started with your next remirror project.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/playground
[npm]: https://npmjs.com/package/@remirror/playground
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/playground
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/playground
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/playground/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/playground

# pnpm
pnpm add @remirror/playground

# npm
npm install @remirror/playground
```

## Inspiration

The playground is a tool for getting started with `remirror` and getting a feel for how to use the project.

### Architecture

`@remirror/playground` is composed of two separate parts.

- **Renderer** - The renderer which takes the provided code and displays the desired code.

  - **Editor Preview** - The produced code is transformed into an esm bundle that is run within the output element.
  - **Debug Tools** - A fork of `prosemirror-dev-tools` with support for updating the content via JSON.

- **Configuration** - the configuration is where the code is generated which will be passed into the renderer.
  - **Code Editor** - A code editor for writing TypeScript / JavaScript with support for multiple tabs. The file use ESModules and the component and should export the component to render as `export default MyEditor`. By default this is readonly and configuration is handled via via the configuration UI.
    - CSS support
    - Multiple tabs
  - **UI** - The UI for configuring the editor. Extensions can be switched on and configured, menus can be added and a whole host of options are available.
    - Configure menus
    - Configure extensions
    - Choose framework \*(Future)

### Features

- Supports TypeScript and intellisense.
- Build a zero-code editor by toggling options and configuring functionality via the editor buildler.
- Add built-in menus, icons and commands.
- Export generated code for use in your own project.
- Automatic installation of imported modules via `https://jspm.dev`.

  ```tsx
  import _ from 'lodash';
  ```

  The above will import lodash and automatically add the types to the editor.

### Upcoming features

- [ ] Persist saved editors by hash.
- [ ] Add support for multiple files.
- [ ] Add support for css.
- [ ] Add `package.json` support for specifying dependency versions.
- [ ] Support picking the `remirror` version.

## Credits

This project would not have been possible without the following contributors.

- **Benjie Gillam** <code@benjiegillam.com>
