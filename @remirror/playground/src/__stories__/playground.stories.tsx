/** @jsx jsx */
import { jsx } from '@emotion/core';
import { storiesOf } from '@storybook/react';

import Playground from '..';

storiesOf('Playground', module)
  .add('Main', () => (
    <Playground />
  ))
