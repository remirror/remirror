import React from 'react';

import { initialJson, manager, plugins, schema } from '@test-fixtures/schema-helpers';
import { render } from '@testing-library/react';
import { EditorState } from 'prosemirror-state';

import { RemirrorSSR } from '..';

const state = EditorState.create({ doc: schema.nodeFromJSON(initialJson), schema, plugins });

test('should render the ssr component', () => {
  const { container } = render(
    <RemirrorSSR
      attributes={{
        class: 'remirror',
        contenteditable: 'false',
        suppressContentEditableWarning: true,
      }}
      manager={manager}
      state={state}
    />,
  );
  expect(container).toHaveTextContent('Better docs to come soon...');
});
