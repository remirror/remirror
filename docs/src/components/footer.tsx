/** @jsx jsx */

import { Container, Footer as FooterUI, jsx } from 'theme-ui';

import NavLink from './nav-link';

export const Footer = () => (
  <FooterUI
    sx={{
      py: 3,
    }}
  >
    <Container>
      <div sx={{ display: 'flex' }}>
        <div sx={{ mx: 'auto' }} />
        <NavLink to='/'>Remirror</NavLink>
        <NavLink href='https://github.com/ifiokjr/remirror'>GitHub</NavLink>
      </div>
    </Container>
  </FooterUI>
);

export default Footer;
