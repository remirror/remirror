import { initialJson } from 'testing';
import { strictRender } from 'testing/react';
import { createReactManager } from '@remirror/react';

import { RemirrorSSR } from '../';

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
