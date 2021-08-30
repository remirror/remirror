---
slug: showcase-next
title: Showcase "NEXT"
author: Ronny Roeller
author_title: Remirror Maintainer
author_url: https://github.com/ronnyroeller
author_image_url: https://avatars.githubusercontent.com/u/9339055?v=4
tags: [remirror, showcase]
---

_TLDR: NEXT picked Remirror as WYSIWYG editor because it grew with their ProseMirror skill set._

<!-- truncate -->

## One size doesn’t fit all

Our users loved when we enabled commenting in the app. Yet, pretty soon they wanted more: On top of the list was the ability to mention other users and to add tags.

After some fruitless attempts to add mentioning to our plain text editor, we made the leap and moved to a proper richtext editor. We picked Quill and plugged it into our application. Again, users loved it but soon wanted more: reference other data, embed content, collaborative editing, etc.

We could address some of these points with Quill’s many config options and modules. Yet, in the end, we realized that we got it all wrong: A monolithic editor with tons of config options would never bring us there. We needed the opposite: a bag of “LEGO bricks” to build our own editor from the ground up.

## Where do we even start?

Prosemirror provided all we could have asked for: extremely flexible, well-thought through architecture, great community, and many users (such as Atlassian and the New York Times).

Yet, we ended up with the opposite problem than before: We could do everything in theory but the learning curve to do it in practice was brutal. Adding simple features, like editing links, required to deep dive into the stack. In the end of these deep dives, we often marveled about Prosemirror’s elegance — yet, these were really rough journeys.

React turned out to be another curveball. React promotes certain ways of doing things, like using hooks; but Prosemirror is framework-agnostic. This resulted in lots of glueing code to bridge conceptional gaps.

Basically, we had succeeded in replacing our monolithic editor with LEGO bricks — but these were all 1x1 pieces, no set manual included.

## Grow complexity in line with our skillset

That’s when we found out about Remirror. Remirror’s founder Ifiok brought Prosemirror into the React world. Functional blocks, like link handling, were encapsulated into extensions. Next to these standard extensions, we could simply add our own extensions to tailor the editor to our needs. What won us over was that Remirror made complexity optional.

At the start, we simply plugged in one of the pre-packaged editors. The `<SocialEditor>` had all modern formatting options (bold, headings, blockquote, etc) and supported social features like mentioning, tagging, and emojis.

Once we grew out of the pre-packaged editor, we went a level deeper and built our own editor using Remirror’s ready-to-go React components. Once we needed more flexibility, we replaced some of those with our own components, which leverage Remirror’s hooks. And in exceptional cases we went even further down, and added functionality on the Prosemirror level.

In contrast to our earlier experience with pure Prosemirror, developers didn’t have to be experts on day one. And in contrast to the monolithic editor, we never hit a glass ceiling while building out our editor.

## Wrapping up

By now, we’ve been using Remirror in production for over a year. One of the Remirror contributors joined our team and we’re actively contributing to the community. Most importantly, for the first time, we feel that we can deliver the “users want more” within our existing stack.

So, if you’re looking for a richtext editor for your React application: put Remirror on your shortlist! :)

Happy coding!

_This post was originally published on [Medium](https://medium.com/collaborne-engineering/rich-text-editor-for-react-f7d71746867f)._
