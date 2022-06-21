import { LinkExtension, PlaceholderExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const TriggerCharacter = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions: () => [
      new LinkExtension({ autoLink: true, autoLinkAfter: /[\t\n ),.\]]/g }),
      new PlaceholderExtension({ placeholder: 'autoLinkAfter property is set to /[\\t\\n ),.]]/' }),
    ],
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} />
    </ThemeProvider>
  );
};

export default TriggerCharacter;
