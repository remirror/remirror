/**
 * @module
 *
 * This provides the component which uses a resizable grid layout.
 */

import type { FC } from 'react';
import { Responsive, ResponsiveProps } from 'react-grid-layout';
import { SizeMe } from 'react-sizeme';

/**
 * The responsive grid layout which responds to resizing the browser window.
 */
const ResponsiveGridLayout: FC<ResponsiveProps> = (props) => {
  return (
    <SizeMe monitorHeight={false}>
      {({ size }) => <Responsive {...props} width={size.width ?? undefined} />}
    </SizeMe>
  );
};

/**
 * The component with resizable layout slots.
 */
export const PlaygroundLayout: FC = () => {
  return (
    <ResponsiveGridLayout
      className='layout'
      layouts={{ lg: [], sm: [] }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
    >
      <div key='1'>1</div>
      <div key='2'>2</div>
      <div key='3'>3</div>
    </ResponsiveGridLayout>
  );
};
