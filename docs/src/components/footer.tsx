/** @jsx jsx */

import { Container, jsx } from 'theme-ui';

import NavLink from './nav-link';

export const Footer = () => (
  <Container>
    <div sx={{ display: 'flex' }}>
      <div sx={{ mx: 'auto' }} />
      <NavLink to='/'>Remirror</NavLink>
      <NavLink href='https://github.com/remirror/remirror'>GitHub</NavLink>
    </div>
  </Container>
);

export default Footer;
