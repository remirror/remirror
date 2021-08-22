---
hide_title: true
title: 'useMention'
---

# `useMention`

## Summary

A hook that provides the state for social mentions that responds to keybindings and key-presses from the user.

This is used by the `SocialMentionDropdown` component and can be used by you for a customized component.

The only prop required is the list of data in order to support keybinding and properly selecting the index for you. The data must have a `label` and `id` key. The label is the text that should be shown inside the mention and the `id` is whatever unique identifier that can be used.

You can also add other supported attributes which will be added to the mention node, like `href` and whatever you decide.

## Examples

See [storybook](https://remirror.vercel.app/?path=/story/react-hooks-usemention--basic) for examples.
