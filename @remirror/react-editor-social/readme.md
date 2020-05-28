# @remirror/react-editor-social

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/react-editor-social.svg?)](https://bundlephobia.com/result?p=@remirror/react-editor-social)
[![npm](https://img.shields.io/npm/dm/@remirror/react-editor-social.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/react-editor-social)

> A configurable editor which replicates a social editors behaviour.

## Usage

The following editor would add emoji characters as valid prefix characters when typing the `@` key
in the editor.

```tsx
import emojiRegex from 'emoji-regex';
import { SocialEditor } from '@remirror/react-editor-social';

const Editor = (props) => (
  <SocialEditor
    {...props}
    attributes={{ 'data-testid': 'react-editor-social' }}
    userData={[]}
    tagData={[]}
    onMentionChange={onChange}
    atMatcherOptions={{
      // Adds emoji characters the the valid prefix characters.
      validPrefixCharacters: `^([\\s\\0]|${emojiRegex().source})?$`,
    }}
  />
);
```

### Installation

```bash
yarn add @remirror/react-editor-social # yarn
pnpm add @remirror/react-editor-social # pnpm
npm install @remirror/react-editor-social # npm
```
