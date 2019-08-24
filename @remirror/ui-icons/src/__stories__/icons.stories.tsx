import { kebabCase } from '@remirror/core';
import { useRemirrorTheme } from '@remirror/ui';
import { storiesOf } from '@storybook/react';
import React, { FC } from 'react';
import * as BaseIcons from '../base';
import * as EditorIcons from '../editor';

const NameWrapper = ({ name }: { name: string }) => {
  const { sx } = useRemirrorTheme();

  return (
    <p
      css={sx({
        textAlign: 'center',
      })}
    >
      {kebabCase(name)
        .split('-')
        .join(' ')}
    </p>
  );
};

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

const IconWrapper: FC = ({ children }) => {
  const { sx } = useRemirrorTheme();

  return (
    <div
      css={sx({
        p: 1,
        minHeight: 100,
        justifyContent: 'start',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        '&:hover svg': {
          transform: 'scale(1.5)',
        },
      })}
    >
      {children}
    </div>
  );
};

storiesOf('Icons', module)
  .add('Base Icons', () => (
    <Grid>
      {Object.entries(BaseIcons).map(([name, Icon]) => {
        return (
          <IconWrapper key={name}>
            <Icon size='1.5em' />
            <NameWrapper name={name} />
          </IconWrapper>
        );
      })}
    </Grid>
  ))
  .add('Editor Icons', () => (
    <Grid>
      {Object.entries(EditorIcons).map(([name, Icon]) => {
        return (
          <IconWrapper key={name}>
            <Icon size='1.5em' />
            <NameWrapper name={name} />
          </IconWrapper>
        );
      })}
    </Grid>
  ));
