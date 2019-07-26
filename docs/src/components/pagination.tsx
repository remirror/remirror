/** @jsx jsx */
import { Location } from '@reach/router';
import { Pagination as PaginationUI } from '@theme-ui/sidenav';
import { jsx } from 'theme-ui';
import Sidenav from '../sidebar.mdx';

export const Pagination = () => (
  <Location>
    {({ location }) => (
      <Sidenav
        pathname={location.pathname}
        sx={{
          py: 4,
        }}
        components={{
          wrapper: PaginationUI,
        }}
      />
    )}
  </Location>
);

export default Pagination;
