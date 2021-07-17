/**
 * @module
 *
 * The `ThemeProvider` to wrap your editor with when using these components.
 */

import { createContext, ElementType, ReactElement, ReactNode, useContext, useMemo } from 'react';
import { Provider as ReakitProvider } from 'reakit';
import { cx, deepMerge } from '@remirror/core';
import { createThemeVariables, CSSProperties, RemirrorThemeType, THEME } from '@remirror/theme';

import * as system from '../reakit-system';

const ThemeContext = createContext<RemirrorThemeType>({});

export interface UseThemeProps {
  /**
   * The theme to customise the look and feel of your remirror editor.
   */
  theme?: RemirrorThemeType;
  /**
   * Any extra class names to add to the wrapper component.
   */
  className?: string;
}

/**
 * Get the theme from the context and convert it to a style object which can be
 * attached to any element.
 *
 * The theme provided is deeply merged with the parent theme.
 */
export function useTheme(props: UseThemeProps = {}): {
  theme: RemirrorThemeType;
  style: CSSProperties;
  className?: string;
} {
  // Get theme from parent context.
  const parent = useContext(ThemeContext);
  const theme = useMemo(() => deepMerge(parent, props.theme ?? {}), [parent, props.theme]);
  const style = useMemo(() => createThemeVariables(theme).styles, [theme]);
  const className = cx(THEME, props.className);

  return useMemo(() => ({ style, className, theme }), [style, className, theme]);
}

export interface ThemeProviderProps extends UseThemeProps {
  /**
   * A custom component to use for the wrapper.
   *
   * @default 'div'
   */
  as?: ElementType<{ style?: CSSProperties; className?: string }>;

  children: ReactNode;
}

/**
 * This the `ThemeProvider`. Wrap your editor with it to customise the theming
 * of content within your editor.
 *
 * Please be aware that this wraps your component in an extra dom layer.
 */
export const ThemeProvider = (props: ThemeProviderProps): ReactElement<ThemeProviderProps> => {
  const { children, as: Component = 'div' } = props;
  const { theme, style, className } = useTheme({ theme: props.theme });

  return (
    <ReakitProvider unstable_system={system}>
      <ThemeContext.Provider value={theme}>
        <Component style={style} className={className}>
          {children}
        </Component>
      </ThemeContext.Provider>
    </ReakitProvider>
  );
};
