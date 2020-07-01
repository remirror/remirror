/** @jsx jsx */

import { Container, jsx } from 'theme-ui';

import NavLink from './nav-link';

export const Footer = () => (
  <Container>
    <div sx={{ display: 'flex', alignItems: 'center' }}>
      <div sx={{ mx: 'auto' }} />
      <NavLink href='https://www.netlify.com'>
        <img src='https://www.netlify.com/img/global/badges/netlify-light.svg' />
      </NavLink>
      <NavLink to='/'>Remirror</NavLink>
      <NavLink href='https://github.com/remirror/remirror'>GitHub</NavLink>
    </div>
  </Container>
);

export default Footer;
