import './styles.css';

import { useCallback } from 'react';
import { PlaceholderExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

export default { title: 'Placeholder Extension' };

export const Basic = (): JSX.Element => {
  const extensions = useCallback(
    () => [new PlaceholderExtension({ placeholder: `I'm a placeholder!` })],
    [],
  );
  const { manager } = useRemirror({ extensions });

  return (
    <ThemeProvider>
      <Remirror manager={manager} />
    </ThemeProvider>
  );
};

export const CustomStyle = (): JSX.Element => {
  const extensions = useCallback(
    () => [
      new PlaceholderExtension({
        placeholder: `I'm a styled placeholder!`,
        emptyNodeClass: 'my-placeholder',
      }),
    ],
    [],
  );
  const { manager } = useRemirror({ extensions });

  return (
    <ThemeProvider>
      <Remirror manager={manager} />
    </ThemeProvider>
  );
};
