/** @jsx jsx */
import { jsx } from 'theme-ui';

type SelectProps = JSX.IntrinsicElements['select'];

export const Select = (props: SelectProps) => (
  <select
    id={props.name}
    {...props}
    sx={{
      fontFamily: 'system-ui, sans-serif',
      fontSize: 16,
      p: 2,
    }}
  />
);

export default Select;
