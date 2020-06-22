/** @jsx jsx */

import { Global } from '@emotion/core';
import { FC, Fragment, useCallback, useRef, useState } from 'react';
import { Box, Container, Flex, jsx, Styled } from 'theme-ui';

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
  const sidebarRef = useRef<HTMLDivElement>(null);
  const onSidebarFocus = useCallback(() => setMenuOpen(true), []);
  const onSidebarBlur = useCallback(() => setMenuOpen(false), []);
  const onSidebarClick = useCallback(() => setMenuOpen(false), []);

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
      <Flex
        sx={{
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Header nav={sidebarRef} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <Box
          sx={{
            flex: '1 1 auto',
          }}
        >
          <Container
            sx={{
              py: 0,
              px: fullWidth ? 0 : 3,
              maxWidth: fullWidth ? 'none' : '',
              display: ['block', 'flex'],
              mx: fullWidth ? 0 : -3,
            }}
          >
            <Sidebar
              fullWidth={fullWidth}
              ref={sidebarRef}
              open={menuOpen}
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
          </Container>
        </Box>
        <Footer />
      </Flex>
    </Styled.root>
  );
};
