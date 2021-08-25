---
slug: decouple-render
title: Decouple look&feel from Remirror extensions
author: Ronny Roeller
author_title: Remirror Maintainer
author_url: https://github.com/ronnyroeller
author_image_url: https://avatars.githubusercontent.com/u/9339055?v=4
tags: [remirror, pattern]
---

_TLDR: Use render props in Remirror extensions to allow apps use their own component libraries_

<!-- truncate -->

Prosemirror is hands-down the best toolkit to build rich-text editors on the web. Yet, it’s also “only” a toolkit and composing your own editor can still be quite challenging. Remirror bridges this gap. With Remirror, creating a Prosemirror-based editor takes minutes and feels very natural to any React developer (hooks, props, etc).

On top of this, Remirror comes with dozens of handy extensions like tables, callouts, and the likes. This dramatically speeded up our initial journey from zero to first-class editor. We ended up building our editor with a mix of open-source and proprietary Remirror extensions (which we open-sourced as far as possible).

## Mismatching UI

Yet, those extensions also introduce an interesting dilemma: The richer the UI a Remirror extension provides, the harder it gets to match their look & feel into an existing application.

Let’s take for example an Remirror extension, which shows a news article:

```ts
@extensionDecorator({})
export class ArticleExtension extends NodeExtension {
  ReactComponent: ComponentType<NodeViewComponentProps> = ({ node }) => (
    <div className='article'>
      <div className='name'>{node.attrs.name}</div>
      <div>{node.attrs.description}</div>
    </div>
  );
}
```

It’s possible to style the article via CSS to a degree. Yet, matching the look & feel to the rest of the application can get very difficult. We use for example the material-ui component library. In our world, the article node should look like a `<Card />` component: ![Material-ui card component](https://miro.medium.com/max/433/1*Uv9dWSJFZIXZMvIX_5F7gg.png)

## Material-ui card component

In a real application, this article card would include also a photo, an action button, a popup menu, etc. And all of those should look & feel like the material-ui components. Trying to mimic this via CSS is getting out of hand very quickly.

An alternative would be to rendered the material-ui components directly in the Remirror extension like this:

```ts
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';

@extensionDecorator({})
export class ArticleExtension extends NodeExtension {
  ReactComponent: ComponentType<NodeViewComponentProps> = ({ node }) => (
    <Card>
      <CardHeader title={node.attrs.name} />
      <CardContent>{node.attrs.description}</CardContent>
    </Card>
  );
}
```

The drawback of this approach is that the Remirror extension is now coupled to the material-ui component library. For proprietary extensions this isn’t ideal (ever want to change a component library?) For open source extensions it’s a non-starter.

So, how to decouple the look & feel from the Remirror extension?

## Render props to the rescue

For those situation, our go-to pattern are render props. The Remirror extension thereby exposes an option in the format of(state) => React.ReactElement and uses this afterwards to render the component.

The extension provides via the defaultOptions a trivial implementation for the render prop, so it can be easily used e.g. in the playground:

```ts
export type RenderArticle = (article: Article) => React.ReactElement<HTMLElement> | null;
export interface ArticleOptions {
  renderArticle?: RenderArticle;
}
@extensionDecorator<ArticleOptions>({
  defaultOptions: {
    renderArticle: (article: Article) => (
      <div className='article'>
        <div className='name'>{node.attrs.name}</div>
        <div>{node.attrs.description}</div>
      </div>
    ),
  },
})
export class ArticleExtension extends NodeExtension<ArticleOptions> {
  ReactComponent: ComponentType<NodeViewComponentProps> = ({ node }) =>
    this.options.renderArticle({
      name: node.attrs.name,
      description: node.attrs.description,
    });
}
```

The embedding application can now bring in the app-specific components via the render prop:

```ts
const manager = Remirror.useManager([
  new ArticleExtension({
    renderArticle: (article) => (
      <Card>
        <CardHeader title={article.name} />
        <CardContent>{article.description}</CardContent>
      </Card>
    ),
  }),
]);
```

Happy coding!

_This post was originally published on [Medium](https://medium.com/collaborne-engineering/decouple-look-feel-from-remirror-extensions-87a06ad9214e)._
