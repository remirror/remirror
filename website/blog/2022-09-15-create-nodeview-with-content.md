---
slug: create-node-view-with-content
title: Creating NodeViews with content in Remirror
author: Idriss Mahjoubi
author_title: Remirror Maintainer
author_url: https://github.com/IdrissMahjoubi
author_image_url: https://avatars.githubusercontent.com/u/21082433?s=400&u=8d7e62dabe021585fd823ba31c41e394793cfa32&v=4
tags: [remirror, NodeView, contentDOM]
---

<!-- truncate -->

A core concept of Remirror are _NodeViews_, which allow developers to add custom nodes into a document. For example, we might want to add a user card with custom styling and behavior that contains the user's photo, name, and so on. The card would be an HTML element, rendered within the Remirror document. But what if we wanted to add editable content to this node? For example, after we add a user card, we see a “review area” as part of the card itself, where we can write a review (text) about the user.

_NodeViews_ are basically the HTML representation of a Remirror Node. A more advanced NodeView with complex looks and behavior might be complex to create. Lucky for us, we can use React components to create such _NodeViews_.

Whether the NodeView is created from HTML elements or a ReactComponent (which is later converted into HTML by Remirror), They can have a child node that Remirror calls _contentDOM_ - The DOM node that should hold the node's content. In our example the “review area”

There are two build-in Remirror extensions that allow us to create _NodeViews_:

1. Low-level method: _NodeViewsExtension_ allows other extensions to “manually” create _NodeViews_ (e.g. from HTML elements) which alter how the dom is rendered for the node.

2. High-level method: _ReactComponentExtension_ that magically converts a React component into a NodeView by using the functionalities from the _NodeViewsExtension_ mentioned above. This is a higher level extension than _NodeViewsExtension_ and it’s tailored in a way to make react developers life easier.

If you’re not familiar with Remirror’s extensions have a look at [extensions concept in Remirror docs](https://remirror.io/docs/concepts/extension).

In this article we will mainly demonstrate _ReactComponentExtension_ functionalities and how we can use that to create a NodeView with content.

Here’s a [UserNodeView with content example](https://remirror.vercel.app/?path=/story/components-labs-card-with-content--user-card).([source code](https://github.com/remirror/remirror/blob/d58c4b4d55acd6e057c2fa4c4c0377abc1b8daa8/packages/storybook-react/stories/react-components/node-with-content.stories.tsx))

## Create a new Node without content

### Let Remirror know about our node

First, Remirror needs to know the DOM representation of our node so it can render it (draw it in the document).

We create a new node custom extension called _UserCardExtension_ that must extend the _NodeExtension_ interface. Basically this tells Remirror here’s a new node that you don’t know about.

In our _NodeSpec_ we set the DOM element attributes, add which type of content our node should allow and where it will be added

```typescript
class UserCardExtension extends NodeExtension {
 get name() {
   return 'user-card' as const;
 }
...
  createNodeSpec(): NodeExtensionSpec {
    return {
      attrs: {
        id: { default: null },
        name: { default: '' },
        image: { default: '' },
      },
      content: '',
      toDOM: (node) => {
        const attrs: DOMCompatibleAttributes = {
          'data-user-id': node.attrs.id,
          'data-user-name': node.attrs.name,
          'data-user-image': node.attrs.image,
        };
        return ['div', attrs];
      },
      parseDOM: [
        {
          attrs: {
            id: { default: null },
            name: { default: '' },
            image: { default: '' },
          },
          tag: 'div[data-user-id]',
          getAttrs: (dom) => {
            const node = dom as HTMLAnchorElement;
            const id = node.getAttribute('data-user-id');
            const name = node.getAttribute('data-user-name');
            const image = node.getAttribute('data-user-image');

            return {
               id,
               name,
               image,
             };
           },
         },
       ],
     };
   }
 }
}
```

As you may have noticed in the example above, we don’t allow for content at all (`content: ''`), We tell Remirror what to parse from the DOM and how to render to the DOM.

### Create a NodeView for our new node using ReactComponent property

Next we will add our custom react component to represent the user card node in the editor without content.

```typescript
function UserCard({ node }) {
  const { name, imageSrc } = node.attrs;

  return (
    <div className='card'>
      <img src={imageSrc} />
      <h4>{name}</h4>
    </div>
  );
}
```

We assign our _UserCard_ component to the ReactComponent property provided by the built-in _ReactComponentExtension_.

```typescript
class UserCardExtension extends NodeExtension {
 get name() {
   return 'user-card' as const;
 }
 ReactComponent: ComponentType<NodeViewComponentProps> = UserCard
 …
}
```

Congratulations, we created a _UserNodeView_ without content.

## Allow Node to have editable content

To the main objective, we will make the changes to our extension to allow for editable content in our user node. First, we change the _NodeSpec_ to tell Remirror to allow empty or block content.

```typescript
class UserCardExtension extends NodeExtension {
 get name() {
   return 'user-card' as const;
 }
...
  createNodeSpec(): NodeExtensionSpec {
    return {
      attrs: {
        id: { default: null },
        name: { default: '' },
        imageSrc: { default: '' },
      },
      content: ‘block*’,
      toDOM: (node) => {
        const attrs: DOMCompatibleAttributes = {
          'data-user-id': node.attrs.id,
          'data-user-name': node.attrs.name,
          'data-user-image-url': node.attrs.imageSrc,
        };
        return ['div', attrs, 0];
      },
      …
     };
   }
 }
}
```

In the example above, we allow empty or block content `content: ‘block*’`, and we add a zero as the last argument of the [DOMOutputSpec](https://prosemirror.net/docs/ref/#model.DOMOutputSpec). The number zero (a.k.a “hole”) is used to indicate that a child node can be inserted. If it occurs in an [DOMOutputSpec](https://prosemirror.net/docs/ref/#model.DOMOutputSpec) spec, it should be the only child element in its parent node.

Finally, we set where the content will be added in our React component

```typescript
function UserCard({ node, forwardRef }) {
  const { name, imageSrc } = node.attrs;

  return (
    <div className='card'>
      <div contentEditable='false'>
        <img src={imageSrc} alt='Avatar' style={{ width: '100%' }} />
        <h4>
          <b>{name}</b>
        </h4>
      </div>
      <p ref={forwardRef} />
    </div>
  );
}
```

Note here we pass _forwardRef_ to the child element. This prop must be attached to the part of the tree where content will be rendered to. Once the React ref is available the _forwardRef_ prop appends the contentDOM to the element where it was attached.

For more about why _forwardRef_ is needed [see comment here](https://github.com/remirror/remirror/blob/107cba9f4fd5b604ae8eb08eb922be5565a57474/packages/remirror__extension-react-component/src/react-component-extension.ts#L21).

Since the node accepts content, all editable elements within the node will become .. well, editable. We wrap the editable elements in a div with the attribute `contentEditable='false'` to selectively remove their editing behavior

We now have our _UserNodeView_ that has editable content. Building on this we can [add helpers and commands](https://remirror.io/docs/getting-started/commands-and-helpers/) to set how we want this node to behave within the document.

If you're not using a react component for your custom node you can add content to it directly using createNodeViews like mentioned above checkout the [callout-extension code](https://github.com/remirror/remirror/blob/22dc4de1b20286d19b66624fb4dbb0afba4d9214/packages/remirror__extension-callout/src/callout-extension.ts).

Happy Coding!

_This post was originally published on [Medium](https://medium.com/p/e22e920cbeae)._
