/** @jsx jsx */
import { FC } from 'react';
import { jsx } from 'theme-ui';

export type ButtonProps = JSX.IntrinsicElements['button'];

export const Button: FC<ButtonProps> = (props) => (
  <button
    {...props}
    sx={{
      appearance: 'none',
      fontFamily: 'inherit',
      fontSize: 1,
      fontWeight: 'bold',
      m: 0,
      px: 2,
      py: 2,
      color: 'text',
      bg: 'muted',
      border: 0,
      borderRadius: 2,
      ':focus': {
        outline: '2px solid',
      },
    }}
  />
);

export default Button;
