import { useRemirrorTheme } from '@remirror/ui';
import { storiesOf } from '@storybook/react';
import React, { FC } from 'react';
import { Button } from '../../src';

const Grid: FC = ({ children }) => {
  const { sx } = useRemirrorTheme();

  return (
    <div
      css={sx({
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gridGap: 10,
        justifyContent: 'center',
        justifyItems: 'center',
        p: 3,
      })}
    >
      {children}
    </div>
  );
};

storiesOf('Buttons', module).add('Basic', () => (
  <Grid>
    <Button content='Button' />
    <Button content='Button' variant='primary' />
    <Button content='Button' variant='secondary' />
  </Grid>
));
