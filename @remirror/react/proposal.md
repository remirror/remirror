## Proposal

I've found the current way of dealing with extensions as classes quite cumbersome. It places the burden of configuration on the `user` and is not very `React`ish.

The following is a proposal which makes configuration much simpler.

```ts
import { RemirrorManager, RemirrorEditor } from '@remirror/react';
import { Placeholder, Mention } from '@remirror/core-extensions';
import { MenuComponent, SuggestionsComponent } from './components';

const Editor = () => {
  return (
    <RemirrorManager>
      <Placeholder priority={1} emptyNodeClass='no-placeholder' />
      <Mention priority={1} {...props} />

      <RemirrorEditor>
        <MenuComponent />
        <SuggestionsComponent />
      </RemirrorEditor>
    </RemirrorManager>
  );
};
```

- `RemirrorManager` injects an ExtensionManager instance into the context.
- `RemirrorEditor` inject the `InjectedRenderProps` into the context so that subcomponents can either use hooks and HOC's

The main innovation is enabling extensions to become part of the react UI and automatically creating a manager for any nested RemirrorEditors. This means we can hide implementation details from the user allows the view layer (React) to be responsible for creating the necessary pieces for instantiating a Prosemirror editor.

This also means that we'll need to move away from the default renderProp Provider components are now front and center and the default export to use.

## The current status

At the moment creating a remirror editor is done by adding an extensions props to the remirror editor with all the extensions instantiated with their options.

An example is the current UITwitter component which doesn't look very react-like with.

```ts
<RemirrorEditor extensions={[new Mention({ name: 'mentionHash', ...otherOptions }), new Mention({ name: 'mentionAt', ...otherOptions )]} />
```

## Ideal API

Automated typescript inference is an important goal of this library.

Ideally, the API would have been something along the lines of

- `ExtensionComponent` - A component which takes the Extension constructor as a prop and automatically infers the other props for the React component. It would also

For example:

```tsx
<ExtensionComponent extension={Placeholder} priority={1} emptyNodeClass='no-placeholder' />
```

Unfortunately, while the dynamically created inference works for ordinary class and objects it seems to be lost inside the JSX component and I couldn't get the Typescript types to work automatically.

Because this wasn't possible (or I haven't yet figured out how to make it possible), I've had to break a few of the principles I had wanted to keep while building this project.

- `@remirror/core-extensions` would require a peer dependency on React.
- Each extension now needs to implement a static property `Component`

This all means that the underlying core libraries are coupled to the React view layer.

As soon as possible I'd like to remove this so that extensions can be framework agnostic and the view layers implement components that manage the injection of the mangers into the `RemirrorEditor`.
