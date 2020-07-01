/** @jsx jsx */
import { AccordionNav } from '@theme-ui/sidenav';
import React from 'react';
import { jsx } from 'theme-ui';

import SidebarMdx from '../sidebar.mdx';
import NavLink from './nav-link';

const components = {
  a: NavLink,
  wrapper: AccordionNav,
};

type DivProps = JSX.IntrinsicElements['div'];

interface SidebarProps extends DivProps {
  open: boolean;
  fullWidth: boolean;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ fullWidth, onFocus, onBlur, onClick, ...props }, ref) => (
    <div ref={ref} {...{ onFocus, onBlur, onClick }}>
      <SidebarMdx
        {...props}
        components={components}
        sx={{
          display: [null, fullWidth ? 'none' : 'block'],
          width: 256,
          flex: 'none',
          px: 3,
          pt: 3,
          pb: 4,
          mt: [64, 0],
        }}
      />
    </div>
  ),
);

export default Sidebar;
