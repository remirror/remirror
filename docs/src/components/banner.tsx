/** @jsx jsx */

import { FC } from 'react';
import { Container, jsx, ThemeProvider } from 'theme-ui';

const theme = {
  styles: {
    p: {
      ':first-of-type': {
        fontSize: [6, 7, 7],
        fontWeight: 900,
        letterSpacing: '0.05em',
      },
      fontWeight: 'bold',
      mt: 0,
      mb: 3,
    },
    h1: {
      fontSize: [3, 3, 4],
      mt: 0,
      mb: 4,
    },
    a: {
      display: 'inline-block',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontSize: 2,
      p: 3,
      color: 'primary',
      bg: 'background',
      mr: 3,
      mb: 3,
      borderRadius: 6,
      ':hover': {
        color: 'background',
        bg: 'text',
      },
    },
  },
};

export const Banner: FC = ({ children }) => (
  <ThemeProvider theme={theme}>
    <div
      sx={{
        py: [5, 6],
        color: 'background',
        bg: 'purple',
      }}
    >
      <Container sx={{}}>
        <div
          sx={{
            maxWidth: 512,
            mx: 'auto',
          }}
        >
          {children}
        </div>
      </Container>
    </div>
  </ThemeProvider>
);

export default Banner;
