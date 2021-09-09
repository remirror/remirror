import { useMemo } from 'react';
import { LinkExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const ClickHandler = (): JSX.Element => {
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

export default ClickHandler;
