/** @jsx jsx */

import { Global } from '@emotion/core';
import { FC, Fragment, useRef, useState } from 'react';
import { Container, jsx, Layout as LayoutUI, Main, Styled } from 'theme-ui';

import { FrontMatterProps } from '../typings';
import EditLink from './edit-link';
import Footer from './footer';
import Head from './head';
import Header from './header';
import Pagination from './pagination';
import Sidebar from './sidebar';
import SkipLink from './skip-link';

interface LayoutProps extends FrontMatterProps {
  /**
   * The file path relative to the root of this repository
   */
  relativePath: string;
}

export const Layout: FC<LayoutProps> = ({ children, relativePath, ...props }) => {
  const { fullWidth = false } = props ?? {};
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
                {!fullWidth && (
                  <Fragment>
                    <EditLink relativePath={relativePath} />
                    <Pagination />
                  </Fragment>
                )}
              </div>
            </div>
          </Container>
        </Main>
        <Footer />
      </LayoutUI>
    </Styled.root>
  );
};
