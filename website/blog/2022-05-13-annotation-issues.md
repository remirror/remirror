---
slug: annotation-issues
title: Highlights & Comments
author: Ronny Roeller
author_title: Remirror Maintainer
author_url: https://github.com/ronnyroeller
author_image_url: https://avatars.githubusercontent.com/u/9339055?v=4
tags: [remirror, tip, annotation, commenting, highlights]
---

_TLDR: Model highlights/comments as marks instead of annotations to allow for undo, copy&paste, and collaborative editing_

<!-- truncate -->

Writing text in the editor is typically the central use case when building rich-text editors. Yet, working with text can be equally important. For example, users highlight important snippets in red or they add a comment to discuss a paragraph with somebody else.

_Note: This post explain the concept of annotations vs marks based on highlighting. The same applies to comments in text._

### Highlights as annotations

When we built our initial version of highlighting, we modeled them as annotations: We stored the highlighted sections as a separate data structure in our database. Each highlight contained a.o. the position where it started and where it ended (from/to). On opening the editor, we injected the highlights as Prosemirror decorations. Whenever a highlighted section changed, we updated the database accordingly. See the [AnnotationExtension](/docs/extensions/annotation-extension) for the inner workings.

All was well until we added collaborative editing support…

### Blown up by collaborative editing

Collaborative editing allows multiple users to work in the same Prosemirror document. We shared the two data structures about the same document via two communication channels: The Prosemirror changes were distributed via yjs/webrtc; whereas highlights were written directly to the database and then sync’ed back via websocket subscriptions.

And this **blew up annotations in every way possible**.

For a starter, the **communication channels have very different latencies**: webrtc is basically instant while calling database and awaiting can take 1–2 seconds. This meant that the document might have already been updated whereas the highlight still pointed to the old position. So, the user types a couple of characters, which another users see but the highlighted text jumps only a bit later to the correct position.

Worse, if one of the **channels failed, we ended up with a corrupted document**. For example, if newly inserted characters were persisted but the moving of the highlight wasn’t: the highlight would permanently be a couple of characters off.

The end of the road We concluded that both **data structures had to be communicated via the same communication channel**. Luckily, yjs isn’t Prosemirror-specific but provides generic shared data structures. This allowed us to add the array of highlights to the yjs document, and get both data structures sync’ed together.

This did indeed resolve our biggest synchronization issues. Unfortunately, those had just shadowed everything else that could go wrong with our annotation-based approach. For example, **copy/paste works flawless in the Prosemirror document but supporting the same for highlights proved to be a nightmare. Undo was another really hard one**.

In the end, we concluded that communicating both data structures via the same channel alone could never fully solve the issue. What we need was to merge the data structures: Instead of storing highlights separated from the Prosemirror document, we had to **store the highlights as part of the document**.

### Marks to the rescue

These parallels from the physical world helped us understand the different approaches:

- **Highlights as annotation**: The reader adds a physical bookmark to a page. If the reader afterwards clips a part of the text on that page, and glues it on another page: the bookmark doesn’t follow. The moved text isn’t bookmarked any longer. Highlights as marks: The reader uses a physical highlighter to mark a sentence in yellow. If the reader afterwards clips a part of the sentence and glues it on another page: the marking follows. This means, there are now two text parts, both marked in yellow. To achieve this, we attach a Prosemirror mark to the highlighted text. By making the highlights part of the document, the from/to positions are bound to be correct.

- **What complicates matters**: We have to show highlights also outside the context of the document. For this, we still need to store the highlights in a database, so we can easily query them. Yet, the database contains only derived data: The source of truth is always the Prosemirror document. By continuously comparing highlights in the document to the highlights in the database, we can detect differences and correct them. So, even **if data gets out of sync, it will be eventually consistent**.

One final challenge came when users wanted to add some highlight meta data outside the context of the editor. For example, change the color of the highlight. This meant that the Prosemirror document can’t be the source of truth for the complete highlight. Instead, we define for each highlight field what the source of truth is. For the color, we store in the mark only an ID identifying the highlight but the color itself is stored directly in the database.

Happy coding!

_This post was originally published on [Medium](https://medium.com/collaborne-engineering/prosemirror-highlights-comments-20ce820149ed)._
