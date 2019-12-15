/** @jsx jsx */
import { Sidenav, SidnavProps } from '@theme-ui/sidenav';
import React from 'react';
import { jsx } from 'theme-ui';

import Content from '../sidebar.mdx';
import NavLink from './nav-link';

const components = {
  a: NavLink,
};

interface SidebarProps extends Omit<SidnavProps, 'children' | 'components'> {
  open: boolean;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>((props, ref) => (
  <Sidenav
    {...props}
    components={components}
    ref={ref}
    sx={{
      width: 256,
      flex: 'none',
      px: 3,
      pt: 3,
      pb: 4,
      mt: [64, 0],
    }}
  >
    <Content />
  </Sidenav>
));

export default Sidebar;
