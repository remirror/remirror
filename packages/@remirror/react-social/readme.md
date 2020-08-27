# @remirror/react-social

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/react-social.svg?)](https://bundlephobia.com/result?p=@remirror/react-social) [![npm](https://img.shields.io/npm/dm/@remirror/react-social.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/react-social)

> A configurable editor which replicates a social editors behaviour.

## Usage

The following editor would add emoji characters as valid prefix characters when typing the `@` key in the editor.

```tsx
import { SocialEditor } from '@remirror/react-social';

const Editor = (props) => (
  <SocialEditor
    {...props}
    attributes={{ 'data-testid': 'react-social' }}
    users={[]}
    tags={[]}
    onMentionChange={onChange}
  />
);
```

### Installation

```bash
yarn add @remirror/react-social@next @remirror/pm@next @remirror/react@next # yarn
pnpm add @remirror/react-social@next @remirror/pm@next @remirror/react@next # pnpm
npm install @remirror/react-social@next @remirror/pm@next @remirror/react@next # npm
```
