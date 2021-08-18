import { useMemo } from 'react';
import { LinkExtension } from 'remirror/extensions';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';

import { FloatingLinkToolbar } from './floating-link-toolbar';

export default { title: 'Extensions / Link' };

export const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions: () => [new LinkExtension({ autoLink: true })],
    content: `Type "www.remirror.io" to insert a link:&nbsp;`,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} />
    </ThemeProvider>
  );
};

export const ClickHandler = (): JSX.Element => {
  const linkExtension = useMemo(() => {
    const extension = new LinkExtension();
    extension.addHandler('onClick', (_, data) => {
      alert(`You clicked link: ${JSON.stringify(data)}`);
      return true;
    });
    return extension;
  }, []);
  const { manager, state } = useRemirror({
    extensions: () => [linkExtension],
    content: `Click this <a href="https://remirror.io" target="_blank">link</a>`,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} />
    </ThemeProvider>
  );
};

export const EditDialog = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions: () => [new LinkExtension({ autoLink: true })],
    content: `Click this <a href="https://remirror.io" target="_blank">link</a> to edit it`,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state}>
        <EditorComponent />
        <FloatingLinkToolbar />
      </Remirror>
    </ThemeProvider>
  );
};
