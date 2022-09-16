---
slug: announcement-v2
title: Introducing Remirror v2 🎉
author: Ronny Roeller
author_title: Remirror Maintainer
author_url: https://github.com/ronnyroeller
author_image_url: https://avatars.githubusercontent.com/u/9339055?v=4
tags: [remirror, announcement]
---

_TLDR: Remirror adopts Prosemirror TypeScript support._

<!-- truncate -->

Introducing Remirror v2 🎉

### 🧐 Why?

Remirror stands on the shoulders of giants, most notably Prosemirror itself. We therefore want our community to timely benefit whenever one of these great projects adds new features, bug fixes, and the like.

Recently, Prosemirror released [native Typescript support](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624). In itself this is awesome news. Unfortunately the types differ from the ones from DefinitelyTyped, which underlay many of Remirror's types. This means that we must update our types to not get stuck on an old Prosemirror version.

The bottom line is: Prosemirror basically forced our hand to release a new major version rather soon. Be that as it may, we want to make the most out of this situation! It allows us to move forward some other breaking changes that help the project.

### ✨ What's new?

First, we **removed deprecated features** for good:

- useEvents (plural)
- CSS highlight style for text selection. The default browser’s config is more natural, especially in specific edge cases.

Second, we **clarified the naming of API methods**:

- Rename useEvent to useEditorEvent to avoid confusion with the [proposed React hook](https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md) of the same name.
- Standardize useEditorEvent handlers to have the pattern (event, meta) => boolean (this affects context menu and hover events).

Third, we took on the #1 feedback from the community and **revamped the pre-packaged components**. The toolbar, buttons, etc. are now based on the more common MUI framework (instead of the former Reakit) and avoid any Remirror-specific infrastructure. This simplifies taking the pre-packaged components and adjusting them to your needs incrementally.

### ⬆️ How to migrate?

Please **consult the [migration guide](/docs/migration-v2)** and reach out on [Discord](https://discord.gg/C4cfrMK) if you run into any issues.

🙏 A big thank you to all contributors and earlier testers who made the new major release possible!
