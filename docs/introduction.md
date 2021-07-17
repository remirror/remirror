---
id: introduction
title: Introduction
description: Welcome to the remirror documentation.
slug: '/'
hide_title: true
---

# Introduction

## Motivation

I started **remirror** as a challenge to myself. Would it be possible to build an editor that combined great performance with ease of use? I wanted something that allowed developers like myself to fall in love and feel playful even when working through deeply complex concepts. The editor would need to combine plug-and-play features, with ample room for customisation.

I also wanted to give users of all frameworks, the ability to build an editor by picking and choosing their desired building blocks.

In order to meet my goals, I settled on [ProseMirror](https://prosemirror.net/) as the core editor layer. The second decision was to base the structure of the editor on blocks of functionality called `Extensions`. Each extension would add a slice of beauty to the editor, allowing users to craft their masterpieces.

In this latest version, I believe I'm starting to see these goals come to fruition. Every single part of the editor can be controlled by extensions. For example, the core (`Schema`) is managed by a [built-in extension](https://github.com/remirror/remirror/blob/next/packages/remirror__core/src/builtins/schema-extension.ts). There's already a huge selection of extensions for users to choose from.

And the new API is beautiful. For React, this comes with a slew of drop-in components and hooks. Many more are being worked on. It's almost magical how well it works.

For example, to add a drop down emoji picker to your react editor the following code will suffice.

```tsx
import React from 'react';
import { SocialEmojiComponent, SocialProvider } from '@remirror/react';

const Editor = () => {
  return (
    <SocialProvider>
      <SocialEmojiComponent />
    </SocialProvider>
  );
};
```

With this tiny snippet your editor now supports a really nice ui element. And it's all customisable with ordinary `css`. No more fighting against yet another `CSS-in-JS` library.

There's so much more to come and I'm glad you're taking a look. I hope `remirror` proves to be everything you need for your next text editor and more.

This documentation is still a work in progress. It is being updated in parallel with the `next` branch and still has many iterations before it can be called ready.

While reading through this guide, if you find errors or would like to suggest improvements there are several options.

- Open an issue in our [github repo](https://github.com/remirror/remirror/issues).
- [Join our discord server](https://discord.gg/C4cfrMK) and discuss the problem with us.
- Create a pull request with your proposed improvement by clicking the edit button on the relevant page.
- Move on, because deadlines are looming and life is too short.

Whatever you decide I'm happy that you've taken the time to dive into the `remirror` project.

## Target audience

This guide is targeted at the following audidence.

- Consumers of the library.
- Extension developers.
- Contributors.

Regardless of where you stand, I have endeavoured to make it approachable and interesting for a whole range of developers.

If a section is becoming difficult this guide will endeavour to make it obvious that this is not a easy.

<br />

:::note

Labels will be used to identify areas which may be more advanced.

:::

<br />

### Expected knowledge

This guide assumes that you're familiar with JavaScript and have some understanding of `React`. If you're brand new to programming or JavaScript then many would encourage you to look into other resources before attempting to read through this. I say, don't let that stop you from doing what you want. Joy is a wonderful commodity and if you find any comfort while reading this documentation, then by all means, craft your own beautiful unique path.
