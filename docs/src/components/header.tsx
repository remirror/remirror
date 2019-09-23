/** @jsx jsx */
import { Dispatch, RefObject, SetStateAction } from 'react';
import { Container, Flex, Header as HeaderUI, jsx, useColorMode } from 'theme-ui';
import Button from './button';
import MenuButton from './menu-button';
import NavLink from './nav-link';

const modes = ['light', 'dark'];

interface HeaderProps {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  nav: RefObject<HTMLDivElement>;
}

export const Header = ({ menuOpen, setMenuOpen, nav }: HeaderProps) => {
  const [mode, setMode] = useColorMode();

  const cycleMode = () => {
    const modeIndex = modes.indexOf(mode);
    const next = modes[(modeIndex + 1) % modes.length];
    setMode(next);
  };

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
    <HeaderUI>
      <Container>
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <MenuButton onClick={onMenuClick} />
            <NavLink to='/'>Remirror</NavLink>
          </Flex>
          <Flex>
            <NavLink href='/introduction'>Docs</NavLink>
            <NavLink href='/api'>API</NavLink>
            <NavLink href='https://github.com/ifiokjr/remirror'>GitHub</NavLink>
            <Button
              sx={{
                ml: 2,
              }}
              onClick={cycleMode}
            >
              {mode}
            </Button>
          </Flex>
        </Flex>
      </Container>
    </HeaderUI>
  );
};

export default Header;
