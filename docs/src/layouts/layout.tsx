/** @jsx jsx */

import { Global } from '@emotion/core';
import { FC, useRef, useState } from 'react';
import { Container, jsx, Layout as LayoutUI, Main, Styled } from 'theme-ui';
import EditLink from '../components/edit-link';
import Footer from '../components/footer';
import Head from '../components/head';
import Header from '../components/header';
import Pagination from '../components/pagination';
import Sidebar from '../components/sidebar';
import SkipLink from '../components/skip-link';
import { RootLayoutProps } from '../typings';

export const Layout: FC<RootLayoutProps> = ({ children, ...props }) => {
  const { frontmatter } = props.pageContext;
  const { fullWidth = false } = frontmatter ? frontmatter : {};
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useRef<HTMLDivElement>(null);

  const onSidebarFocus = () => setMenuOpen(true);
  const onSidebarBlur = () => setMenuOpen(false);
  const onSidebarClick = () => setMenuOpen(false);

  return (
    <Styled.root>
      <Head {...props} />
      <Global
        styles={{
          '*': {
            boxSizing: 'border-box',
          },
          body: {
            margin: 0,
          },
        }}
      />
      <SkipLink>Skip to content</SkipLink>
      <LayoutUI>
        <Header nav={nav} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <Main>
          <Container
            sx={{
              py: 0,
              px: fullWidth ? 0 : 3,
              maxWidth: fullWidth ? 'none' : '',
            }}
          >
            <div
              sx={{
                display: ['block', 'flex'],
                mx: fullWidth ? 0 : -3,
              }}
            >
              <Sidebar
                ref={nav}
                open={menuOpen}
                sx={{
                  display: ['none', fullWidth ? 'none' : 'block'],
                }}
                onFocus={onSidebarFocus}
                onBlur={onSidebarBlur}
                onClick={onSidebarClick}
              />
              <div
                id='content'
                sx={{
                  width: '100%',
                  minWidth: 0,
                  px: fullWidth ? 0 : 3,
                }}
              >
                {children}
                <EditLink />
                {!fullWidth && <Pagination />}
              </div>
            </div>
          </Container>
        </Main>
        <Footer />
      </LayoutUI>
    </Styled.root>
  );
};

export default Layout;
