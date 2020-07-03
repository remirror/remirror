# @remirror/react-social

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/react-social.svg?)](https://bundlephobia.com/result?p=@remirror/react-social)
[![npm](https://img.shields.io/npm/dm/@remirror/react-social.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/react-social)

> A configurable editor which replicates a social editors behaviour.

## Usage

The following editor would add emoji characters as valid prefix characters when typing the `@` key
in the editor.

```tsx
import emojiRegex from 'emoji-regex';
import { SocialEditor } from '@remirror/react-social';

const Editor = (props) => (
  <SocialEditor
    {...props}
    attributes={{ 'data-testid': 'react-social' }}
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
yarn add @remirror/react-social # yarn
pnpm add @remirror/react-social # pnpm
npm install @remirror/react-social # npm
```
