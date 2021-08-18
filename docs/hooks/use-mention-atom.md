---
hide_title: true
title: 'useMentionAtom'
---

# `useMentionAtom`

## Summary

A hook that provides the state for social mention atoms that responds to keybindings and key-presses from the user.

- The difference between this and the `useMention` is that `useMention` creates editable mentions that can be changed over an over again. This creates atom mention which are inserted into the editor as non editable nodes. Backspacing into this node will delete the whole mention.
- In order to properly support keybindings you will need to provide a list of data that is to be shown to the user. This allows for the user to press the arrow up and arrow down key.
- You can also add other supported attributes which will be added to the mention node, like `href` and whatever you decide upon.

## Examples

See [storybook](https://remirror.vercel.app/?path=/story/react-hooks-usementionatom--basic) for examples.
