/** @jsx jsx */
import { Container, ThemeProvider, jsx } from 'theme-ui';

export const Tiles = (props: any) => (
  <ThemeProvider
    theme={{
      styles: {
        ul: {
          listStyle: 'none',
          display: ['block', 'grid'],
          gridTemplateColumns: ['auto', 'repeat(3, 1fr)'],
          gridGap: 24,
          p: 0,
          m: 0,
        },
        li: {
          py: 3,
          px: [0, 2],
        },
      },
    }}
  >
    <Container {...props} py={4} />
  </ThemeProvider>
);

export default Tiles;
