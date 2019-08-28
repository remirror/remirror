import { useRemirrorTheme } from '@remirror/ui';
import { storiesOf } from '@storybook/react';
import React, { FC } from 'react';
import { Caption, H1, H2, H3, H4, H5, H6, Label, Text } from '../';

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

storiesOf('Text', module)
  .add('Headers', () => (
    <Grid>
      <H1>Heading 1</H1>
      <H2>Heading 2</H2>
      <H3>Heading 3</H3>
      <H4>Heading 4</H4>
      <H5>Heading 5</H5>
      <H6>Heading 6</H6>
    </Grid>
  ))
  .add('Text', () => (
    <Grid>
      <Text>
        This is general text.
        <br />
        At some point documentation needs to be written for this library. How is it that I have the energy to
        type out this text, but not the energy to finish up the docs?
      </Text>
      <Label>This is a label.</Label>
      <Caption>This is a caption</Caption>
    </Grid>
  ));
