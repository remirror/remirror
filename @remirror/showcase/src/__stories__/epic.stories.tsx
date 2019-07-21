import { storiesOf } from '@storybook/react';
import React from 'react';
import { EpicModeDefault, EpicModeHeart, EpicModeSpawning } from '../epic-mode';

storiesOf('EpicMode Example', module)
  .add('Default', () => <EpicModeDefault />)
  .add('Spawning', () => <EpicModeSpawning />)
  .add('Heart', () => <EpicModeHeart />);
