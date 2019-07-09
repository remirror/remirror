import React from 'react';
import 'react-native';
import Entry from '../entry';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

test('renders correctly', () => {
  renderer.create(<Entry />);
});
