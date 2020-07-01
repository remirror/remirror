/** @jsx jsx */

import { Dispatch, RefObject, SetStateAction } from 'react';
import { Flex, jsx } from 'theme-ui';

import Logo from './logo';
import MenuButton from './menu-button';
import NavLink from './nav-link';

interface HeaderProps {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  nav: RefObject<HTMLDivElement>;
}

export const Header = ({ menuOpen, setMenuOpen, nav }: HeaderProps) => {
  const onMenuClick = () => {
    setMenuOpen(!menuOpen);

    if (!nav.current) {
      return;
    }

    const navLink = nav.current.querySelector('a');

    if (navLink) {
      navLink.focus();
    }
  };

  return (
    <Flex
      sx={{
        backgroundColor: 'primary',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Flex
        as='header'
        sx={{
          height: 64,
          width: ['100%', '100%', '90%'],
          maxWidth: 1000,
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white',
        }}
      >
        <Flex sx={{ alignItems: 'center' }}>
          <NavLink to='/'>
            <Logo size='3em' />
          </NavLink>
        </Flex>
        <Flex sx={{}}>
          <NavLink href='/introduction'>Documentation</NavLink>
          <NavLink href='/api'>API</NavLink>
          <NavLink href='/playground'>Playground</NavLink>
          <NavLink href='https://github.com/remirror/remirror'>GitHub</NavLink>
          <MenuButton onClick={onMenuClick} />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Header;
