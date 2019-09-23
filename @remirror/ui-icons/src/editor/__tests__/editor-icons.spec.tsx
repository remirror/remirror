import React from 'react';
import renderer from 'react-test-renderer';
import * as EditorIcons from '../';

test('editor icon snapshots', () => {
  const wrapper = renderer.create(
    <>
      {Object.entries(EditorIcons).map(([name, Icon]) => {
        return <Icon size='1.5em' key={name} />;
      })}
    </>,
  );

  expect(wrapper).toMatchSnapshot();
});
