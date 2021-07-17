# @remirror/extension-annotation

> This extension allows to annotate the content in your editor

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-annotation
[npm]: https://npmjs.com/package/@remirror/extension-annotation
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-annotation
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-annotation
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-annotation/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-annotation

# pnpm
pnpm add @remirror/extension-annotation

# npm
npm install @remirror/extension-annotation
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { AnnotationExtension } from 'remirror/extensions';

const extension = new AnnotationExtension();
```

## Background

Annotation enrich parts of a document. For example, a user could annotate a sentence as "important" to find it back later on.

Annotations differ from marks in that they can span across multiple Prosemirror nodes. Prosemirror stores all content in a flat sequence of nodes. For example, the text "**bold _italic_ bold**" contains 3 different nodes (italic splits the node) - not as one bold node with an italic sub node. In contrast, one annotation could covered the whole text with multiple nodes. This is relevant if you want to show a list of sentences marked as "important" or if you want to allow users to rename the "important" annotation (which otherwise would have to be done in all nodes).

### Overlapping annotations

Annotations can be partially or fully overlapping. For example, a user could annotate the "important" sentence as well with "to be reviewed" or a word in the sentence as "customer X".

The annotation extension provides logic to visualize such overlapping annotations by mixing colors. See storybook for an example.

### Extendable data model

The extension defines only the minimal required fields: position where the annotation starts/ends and an ID. For convince, the annotation provides also the text covered by the annotation.

An app using the annotation-extension can extend the base data model. For example, it could add a label (like "important") or a color to each annotation. The annotation extension will pass these custom fields simply through to the app.

### Collaborative editing (yjs)

Annotations are a separate data structure, next to the Prosemirror document, and are therefore not shared via Remirror's yjs-extension. The annotation-extension provides its own support for collaborative editing via yjs.
