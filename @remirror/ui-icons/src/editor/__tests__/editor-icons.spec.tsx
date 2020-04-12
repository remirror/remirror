import React from 'react';
import renderer from 'react-test-renderer';

import { entries } from '@remirror/core';

import * as EditorIcons from '..';

test.each(entries(EditorIcons))('`%s` snapshot', (_, Icon) => {
  const wrapper = renderer.create(<Icon size='1.5em' key={name} />);

  expect(wrapper).toMatchSnapshot();
});
