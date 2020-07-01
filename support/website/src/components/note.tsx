/** @jsx jsx */
import { jsx } from 'theme-ui';

type DivProps = JSX.IntrinsicElements['div'];

export const Note = (props: DivProps) => (
  <div
    {...props}
    sx={{
      fontWeight: 'bold',
      fontSize: 1,
      p: 3,
      bg: 'highlight',
    }}
  />
);

export default Note;
