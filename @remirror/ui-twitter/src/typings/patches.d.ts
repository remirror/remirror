import { InterpolationWithTheme } from '@emotion/core';
import { UITwitterTheme } from '../theme';

declare module 'react' {
  interface DOMAttributes<T> {
    css?: InterpolationWithTheme<UITwitterTheme>;
  }
}
