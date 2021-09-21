---
id: introduction
title: Introduction
description: Welcome to the remirror documentation.
slug: '/'
hide_title: true
---

# Introduction

## Overview

Remirror is a wrapper library for [ProseMirror](https://prosemirror.net/), it is an abstraction layer that makes ProseMirror easier to work with, and provides React and ProseMirror integration.

**_ProseMirror_** is a toolkit for building rich text editors, it is not an out-the-box solution like Draft.JS for instance. This means ProseMirror has a steep learning curve - there are many concepts and terms to learn, and it can be difficult to structure you codebase in a logic manner.

**_Remirror_** provides **extensions**, that abstract over various ProseMirror concepts such as schemas, commands and plugins, making it much simpler to group related logic together.

Think of Remirror like Lego, you can follow the instructions to construct an out-of-the-box style editor, or as the basis of something much more bespoke, via its commands, helpers and hooks.

This means we can provide both "out-of-the-box" and "bespoke" experiences, maintaining the power and flexibility that ProseMirror is known for.

### Extensions

Remirror provides lots of extensions some are built-in, like the `HistoryExtension` (undo and redo), others are opt-in like `BoldExtension`.

Each extension provides a wealth of functionality - like **keyboard shortcuts**, **input rules** (markdown shortcuts), **parsing of pasted HTML** and more. They also provide commands that can be triggered by external components. In raw ProseMirror you would need to implement each of these pieces of functionality yourself, in Remirror it is all encapsulated within a single extension.

## Target audience

This guide is designed for the following:

- Consumers of the library.
- Extension developers.
- Contributors.

Regardless of where you stand, I have endeavoured to make it approachable and interesting for a whole range of developers.

If a section is becoming difficult this guide will endeavour to make it obvious that this is not easy.

<br />

:::note

Labels will be used to identify areas which may be more advanced.

:::note

<br />

### Expected knowledge

This guide assumes that you're familiar with **JavaScript** and have some understanding of `React`. If you're brand new to programming or JavaScript then many would encourage you to look into other resources before attempting to read through this.

:::note

Found an error in the documentation? Please help us to improve:

- Open an issue in our [GitHub repo](https://github.com/remirror/remirror/issues).
- [Join our discord server](https://discord.gg/C4cfrMK) and discuss the problem with us.
- Create a pull request with your proposed improvement by clicking the edit button on the relevant page.

:::note
