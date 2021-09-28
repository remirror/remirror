---
id: 5-min-tutorial
hide_title: true
title: 5 Minute Tutorial
---

# 5 Minute Tutorial

This tutorial walks you through creating a simple React app with Remirror's Social Editor. You need to have a recent Node version installed.

First, let's set up a basic React app with [CRA](https://reactjs.org/docs/create-a-new-react-app.html):

```bash type=installation
npx create-react-app cra-remirror --template typescript
cd cra-remirror
npm install
```

Next, we're installing Remirror:

```bash
npm add --save remirror @remirror/react @remirror/pm @emotion/react @emotion/styled @remirror/react-editors
```

Now, we can use Remirror in the app. For this, replace the `srx/App.tsx` with the following:

```typescript
import { SocialEditor } from '@remirror/react-editors/social';

const USERS = [
  { id: 'joe', label: 'Joe' },
  { id: 'john', label: 'John' },
];
const TAGS = ['remirror', 'editor'];

function App() {
  return <SocialEditor users={USERS} tags={TAGS} />;
}
export default App;
```

Finally, you can run the app:

```bash
npm run start
```
