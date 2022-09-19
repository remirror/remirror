# @remirror/extension-entity-reference

## 2.0.1

> 2022-09-19

### Patch Changes

- Adds four new events `doubleClick`, `doubleClickMark`, `tripleClick` and `tripleClickMark`. They have the same interface as the existing `click` and `clickMark` event, but are triggered when the user double or triple clicks.
- Updated dependencies
  - @remirror/extension-events@2.1.0
  - @remirror/extension-positioner@2.0.1

## 2.0.0

> 2022-09-13

### Major Changes

- Migrate to pure ESM!

### Minor Changes

- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Add an optional onclickmark handler to handle clicks on entity reference
- Update pnpm-lock.yaml

### Patch Changes

- Improve the calculation of changed ranges by utilising mapping
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- add helper to get shortest entity reference
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes `domino` from the codebase.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0
  - @remirror/extension-events@2.0.0
  - @remirror/extension-positioner@2.0.0
  - @remirror/pm@2.0.0

## 2.0.0-beta.19

> 2022-09-12

### Major Changes

- Migrate to pure ESM!

### Minor Changes

- Update pnpm-lock.yaml
- Add an optional onclickmark handler to handle clicks on entity reference
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position

### Patch Changes

- Removes `domino` from the codebase.
- Support both ESM and CJS.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- SSR features are removed.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Expose the return type of the throttle and debounce helpers
- Improve the calculation of changed ranges by utilising mapping
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- add helper to get shortest entity reference
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.19
  - @remirror/extension-events@2.0.0-beta.19
  - @remirror/extension-positioner@2.0.0-beta.19
  - @remirror/pm@2.0.0-beta.19

## 2.0.0-beta.18

> 2022-09-12

### Major Changes

- Migrate to pure ESM!

### Minor Changes

- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Add an optional onclickmark handler to handle clicks on entity reference
- Update pnpm-lock.yaml

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Removes `domino` from the codebase.
- Try to require JSDOM implicitly in node environment.
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- add helper to get shortest entity reference
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-positioner@2.0.0-beta.18
  - @remirror/core@2.0.0-beta.18
  - @remirror/extension-events@2.0.0-beta.18
  - @remirror/pm@2.0.0-beta.18

## 2.0.0-beta.17

> 2022-09-11

### Major Changes

- Migrate to pure ESM!

### Minor Changes

- Add an optional onclickmark handler to handle clicks on entity reference
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Update pnpm-lock.yaml

### Patch Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Support both ESM and CJS.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- SSR features are removed.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Improve the calculation of changed ranges by utilising mapping
- add helper to get shortest entity reference
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Expose the return type of the throttle and debounce helpers
- Removes `domino` from the codebase.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.17
  - @remirror/core@2.0.0-beta.17
  - @remirror/extension-events@2.0.0-beta.17
  - @remirror/extension-positioner@2.0.0-beta.17

## 2.0.0-beta.16

> 2022-09-08

### Major Changes

- Migrate to pure ESM!

### Minor Changes

- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Update pnpm-lock.yaml
- Add an optional onclickmark handler to handle clicks on entity reference

### Patch Changes

- Removes `domino` from the codebase.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- add helper to get shortest entity reference
- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Support both ESM and CJS.
- SSR features are removed.
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.16
  - @remirror/core@2.0.0-beta.16
  - @remirror/extension-events@2.0.0-beta.16
  - @remirror/extension-positioner@2.0.0-beta.16

## 2.0.0-beta.15

> 2022-09-08

### Major Changes

- Migrate to pure ESM!

### Minor Changes

- Add an optional onclickmark handler to handle clicks on entity reference
- Update pnpm-lock.yaml
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- add helper to get shortest entity reference
- Removes `domino` from the codebase.
- Expose the return type of the throttle and debounce helpers
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Support both ESM and CJS.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-events@2.0.0-beta.15
  - @remirror/extension-positioner@2.0.0-beta.15
  - @remirror/pm@2.0.0-beta.15
  - @remirror/core@2.0.0-beta.15

## 2.0.0-beta.14

> 2022-09-05

### Major Changes

- Migrate to pure ESM!

### Minor Changes

- Update pnpm-lock.yaml
- Add an optional onclickmark handler to handle clicks on entity reference
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position

### Patch Changes

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Try to require JSDOM implicitly in node environment.
- add helper to get shortest entity reference
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Expose the return type of the throttle and debounce helpers
- Support both ESM and CJS.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-positioner@2.0.0-beta.14
  - @remirror/core@2.0.0-beta.14
  - @remirror/extension-events@2.0.0-beta.14
  - @remirror/pm@2.0.0-beta.14

## 2.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!

### Minor Changes

- Update pnpm-lock.yaml
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Add an optional onclickmark handler to handle clicks on entity reference

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- add helper to get shortest entity reference
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.13
  - @remirror/extension-events@2.0.0-beta.13
  - @remirror/extension-positioner@2.0.0-beta.13
  - @remirror/core@2.0.0-beta.13

## 2.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!

### Minor Changes

- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Add an optional onclickmark handler to handle clicks on entity reference
- Update pnpm-lock.yaml

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- SSR features are removed.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- add helper to get shortest entity reference
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.12
  - @remirror/extension-events@2.0.0-beta.12
  - @remirror/extension-positioner@2.0.0-beta.12
  - @remirror/pm@2.0.0-beta.12

## 2.0.0-beta.11

> 2022-07-20

### Major Changes

- Migrate to pure ESM!

### Minor Changes

- Update pnpm-lock.yaml
- Add an optional onclickmark handler to handle clicks on entity reference
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position

### Patch Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- add helper to get shortest entity reference
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-positioner@2.0.0-beta.11
  - @remirror/core@2.0.0-beta.11
  - @remirror/extension-events@2.0.0-beta.11
  - @remirror/pm@2.0.0-beta.11

## 2.0.0-beta.10

> 2022-07-19

### Major Changes

- Migrate to pure ESM!

### Minor Changes

- Add an optional onclickmark handler to handle clicks on entity reference

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- add helper to get shortest entity reference
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.10
  - @remirror/core@2.0.0-beta.10
  - @remirror/extension-events@2.0.0-beta.10
  - @remirror/extension-positioner@2.0.0-beta.10

## 2.0.0-beta.9

> 2022-07-18

### Major Changes

- Migrate to pure ESM!

### Patch Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- add helper to get shortest entity reference
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.9
  - @remirror/pm@2.0.0-beta.9
  - @remirror/extension-positioner@2.0.0-beta.9

## 2.0.0-beta.8

> 2022-07-13

### Major Changes

- Migrate to pure ESM!

### Patch Changes

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Try to require JSDOM implicitly in node environment.
- add helper to get shortest entity reference
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-positioner@2.0.0-beta.8
  - @remirror/pm@2.0.0-beta.8
  - @remirror/core@2.0.0-beta.8

## 2.0.0-beta.7

> 2022-07-11

### Major Changes

- Migrate to pure ESM!

### Patch Changes

- SSR features are removed.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Try to require JSDOM implicitly in node environment.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.7
  - @remirror/extension-positioner@2.0.0-beta.7
  - @remirror/pm@2.0.0-beta.7

## 2.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Try to require JSDOM implicitly in node environment.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-positioner@2.0.0-beta.6
  - @remirror/pm@2.0.0-beta.6
  - @remirror/core@2.0.0-beta.6

## 2.0.0-beta.5

> 2022-07-01

### Major Changes

- Migrate to pure ESM!

### Patch Changes

- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.5
  - @remirror/extension-positioner@2.0.0-beta.5
  - @remirror/pm@2.0.0-beta.5

## 2.0.0-beta.4

> 2022-06-29

### Major Changes

- Migrate to pure ESM!

### Patch Changes

- SSR features are removed.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Expose the return type of the throttle and debounce helpers
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.4
  - @remirror/core@2.0.0-beta.4
  - @remirror/extension-positioner@2.0.0-beta.4

## 2.0.0-beta.3

> 2022-06-26

### Major Changes

- Migrate to pure ESM!

### Patch Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.3
  - @remirror/core@2.0.0-beta.3
  - @remirror/extension-positioner@2.0.0-beta.3

## 2.0.0-beta.2

> 2022-06-26

### Major Changes

- Migrate to pure ESM!

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.2
  - @remirror/extension-positioner@2.0.0-beta.2
  - @remirror/pm@2.0.0-beta.2

## 2.0.0-beta.1

> 2022-06-20

### Major Changes

- Migrate to pure ESM!

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-positioner@2.0.0-beta.1
  - @remirror/core@2.0.0-beta.1
  - @remirror/pm@2.0.0-beta.1

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core@1.0.1
  - @remirror/pm@1.0.1

## 1.0.0

> 2021-07-17

### Patch Changes

- Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0)]:
  - @remirror/core@1.0.0
  - @remirror/pm@1.0.0
