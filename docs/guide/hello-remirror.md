---
title: Hello Remirror
hide_title: Hello Remirror
---

# Hello Remirror

The most straightforward way of using `remirror` is to get start with a prebuilt editor. In a later section of this quide I'll walk you through creating your own editor but for now there's enought to learn in consuming the readily available components.

The most popular editor for a long time has been the **social editor**.

First make sure you've followed the instructions in the [installation guide](/docs/guide/installation).

Then you'll need to import the relevant code.

```tsx
import { SocialEditor } from 'remirror/react/social';
import React, { useState } from 'react';
```

This import gives you access to the social editor. Now let's wire it up with some junk data. In reality you'd be fetching this data from an API.

```tsx
import { UserData, TagData } from 'remirror/react/social';

const exampleUsers: UserData[] = [
  {
    avatarUrl: 'https://api.adorable.io/avatars/100/tolu@adorable.io.png',
    displayName: 'Tolu',
    username: 'tolu',
    href: '//test.com/tolu',
    id: 'tolu',
  },
  {
    avatarUrl: 'https://api.adorable.io/avatars/100/timi@adorable.io.png',
    displayName: 'Timi',
    username: 'timi',
    href: '//test.com/tolu',
    id: 'timi',
  },
  {
    avatarUrl: 'https://api.adorable.io/avatars/100/olu@adorable.io.png',
    displayName: 'Olu',
    username: 'olu',
    href: '//test.com/olu',
    id: 'olu',
  },
  {
    avatarUrl: 'https://api.adorable.io/avatars/100/tope@adorable.io.png',
    displayName: 'Tope',
    username: 'tope',
    href: '//test.com/tope',
    id: 'tope',
  },
];

const exampleTags: TagData[] = [
  { tag: 'FunTime', href: '//test.com/funtime', id: 'funtime' },
  { tag: 'StaySafe', href: '//test.com/staysafe', id: 'staysafe' },
  { tag: 'MaskUp', href: '//test.com/maskup', id: 'maskup' },
  { tag: 'RollOut', href: '//test.com/rollup', id: 'rollup' },
  { tag: 'BeBold', href: '//test.com/bebold', id: 'bebold' },
  { tag: 'BeStrong', href: '//test.com/bestrong', id: 'bestrong' },
  { tag: 'YouAreMighty', href: '//test.com/youaremighty', id: 'youaremighty' },
  { tag: 'WelcomeChampion', href: '//test.com/welcomechampion', id: 'welcomechampion' },
];
```

Now that the data is available let's use it.

```tsx live
function MyEditor() {
  const [mention, setMention] = useState(null);

  const onChange = useCallback((parameter) => {
    setMention(parameter);
  }, []);

  console.log(mention);

  const onExit = useCallback(({ query }, command) => {
    command({ href: `/${query.full}` });
  }, []);

  const items = useMemo(() => {
    if (mention && mention.name === 'at' && mention.query) {
      return exampleUsers.filter((user) =>
        user.username.toLowerCase().includes(mention.query.toLowerCase()),
      );
    }

    if (mention && mention.name === 'tag' && mention.query) {
      return exampleTags.filter((tag) =>
        tag.tag.toLowerCase().includes(mention.query.toLowerCase()),
      );
    }

    return [];
  }, [mention]);

  return (
    <SocialEditor
      placeholder='Start typing here'
      autoFocus={false}
      items={items}
      onMentionChange={onChange}
      onExit={onExit}
    />
  );
}
```

Try typing into the editor by using the `@` symbol for mentions and the `#` character for tags. You can also see how it works with `:` for emoji.
