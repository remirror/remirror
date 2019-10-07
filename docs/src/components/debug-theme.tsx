/** @jsx jsx */
import { useContext } from 'react';
import { Context, jsx } from 'theme-ui';

export const DebugTheme = () => {
  const theme = useContext(Context);
  return <pre>{JSON.stringify(theme, null, 2)}</pre>;
};

export default DebugTheme;
