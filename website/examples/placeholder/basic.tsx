import { PlaceholderExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

const extensions = () => [new PlaceholderExtension()];

const ExtensionPlaceholderBasic = () => {
  const { manager, state } = useRemirror({ extensions });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} placeholder="I'm a placeholder..." />
      </ThemeProvider>
    </AllStyledComponent>
  );
};

export default ExtensionPlaceholderBasic;
