import { InterpolationWithTheme } from '@emotion/core';
import { UITwitterTheme } from '../theme';

declare global {
  namespace JSX {
    /**
     * Do we need to modify `LibraryManagedAttributes` too,
     * to make `className` props optional when `css` props is specified?
     */

    interface IntrinsicAttributes {
      css?: InterpolationWithTheme<UITwitterTheme>;
    }
  }
}
