import React, { useCallback, useState } from 'react';
import { LinkExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useExtensionEvent, useRemirror } from '@remirror/react';

const ClickPrinter: React.FC = () => {
  const [lastClickedLink, setLastClickedLink] = useState<string | null>(null);

  useExtensionEvent(
    LinkExtension,
    'onClick',
    useCallback((_, data) => {
      setLastClickedLink(JSON.stringify(data, null, 2));
      return true;
    }, []),
  );

  if (!lastClickedLink) {
    return null;
  }

  return (
    <>
      <h3>Last clicked link info</h3>
      <pre>
        <code>{lastClickedLink}</code>
      </pre>
    </>
  );
};

const ClickHandler = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions: () => [new LinkExtension()],
    content: `Click this <a href="https://remirror.io" target="_blank">link</a>`,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender='start'>
        <ClickPrinter />
      </Remirror>
    </ThemeProvider>
  );
};

export default ClickHandler;
