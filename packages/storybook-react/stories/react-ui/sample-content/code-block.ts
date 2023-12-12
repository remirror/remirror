export const codeBlockContent = `<h1>Custom MUI Theme</h1>
<p>The toolbars in this example are using a MUI theme generated from the config below.</p>
<pre><code data-code-block-language="javascript">import { green, red } from '@mui/material/colors';
import { alpha, createTheme } from '@mui/material/styles';

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
});</code></pre>
<p></p>
`;
