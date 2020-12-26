import { createReactManager } from 'remirror/react';

import { initialJson } from '@remirror/testing';
import { strictRender } from '@remirror/testing/react';

import { RemirrorSSR } from '..';

test('should render the ssr component', () => {
  const manager = createReactManager([]);
  const state = manager.createState({ content: initialJson });

  const { container } = strictRender(
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
