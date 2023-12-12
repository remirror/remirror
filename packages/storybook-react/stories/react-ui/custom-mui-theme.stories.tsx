import 'remirror/styles/all.css';

import { alpha, createTheme, Paper, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { green, red } from '@mui/material/colors';
import React from 'react';
import { wysiwygPreset } from 'remirror/extensions';
import { TableExtension } from '@remirror/extension-react-tables';
import { i18nFormat } from '@remirror/i18n';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { FloatingToolbar, WysiwygToolbar } from '@remirror/react-ui';

import { codeBlockContent } from './sample-content/code-block';

export default { title: 'React UI (labs) / Custom MUI Theme' };

const extensions = () => [...wysiwygPreset(), new TableExtension()];

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#121212',
    },
    divider: alpha('#fff', 0.12),
    primary: {
      light: green[50],
      main: green[500],
      dark: green[700],
      contrastText: '#fff',
    },
    secondary: {
      light: red[50],
      main: red[500],
      dark: red[700],
      contrastText: '#fff',
    },
  },
});

export const CustomMuiTheme = () => {
  const { manager, state } = useRemirror({
    extensions,
    content: codeBlockContent,
    selection: 'start',
    stringHandler: 'html',
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeProvider>
        <Remirror
          manager={manager}
          initialContent={state}
          placeholder='Enter your text'
          i18nFormat={i18nFormat}
          autoRender={false}
          autoFocus
        >
          <Paper elevation={0} square sx={{ p: 2 }}>
            <WysiwygToolbar />
          </Paper>
          <FloatingToolbar />
          <EditorComponent />
        </Remirror>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};
