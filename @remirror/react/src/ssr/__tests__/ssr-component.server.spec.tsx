import { render } from '@testing-library/react';
import React from 'react';

import { createBaseManager, initialJson } from '@remirror/test-fixtures';

import { RemirrorSSR } from '..';

test('should render the ssr component', () => {
  const manager = createBaseManager();
  const state = manager.createState({ content: initialJson });

  const { container } = render(
    <RemirrorSSR
      editable={true}
      attributes={{
        class: 'remirror',
      }}
      manager={manager}
      state={state}
    />,
  );

  expect(container).toHaveTextContent('Better docs to come soon...');
});
