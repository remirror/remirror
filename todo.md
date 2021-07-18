- [ ] Create examples folder within the website directory.

  - Can have tests run against a single url.

- Create a component that renders the provided examples component and can provide the source code.
- All examples would be written in TypeScript
- We can use a babel transform to convert TypeScript to readable JavaScript (only remove types).

- The component <ExampleBlock name='bold-editor' /> - will have access to the source code and also the LIVE URL. Render an iFrame of the example as well as the source code.
- The example block should also be able to:

  - download a zip of the source
  - provide a link to edit in `codesandbox`
  - \[BONUS\] provide a directly editable code environment.

- Create a top level examples page with all the examples rendered as a list.

- Mentioned by Will

- Problems: How to use the same editor instance for new content without the history.
- `NodeViews`
- `onDestroy` - When should this be called.
