/* tslint:disable:no-implicit-dependencies */

import React, { FunctionComponent, MouseEventHandler, useState } from 'react';

import { Remirror, RemirrorEventListener, RemirrorProps } from '@remirror/react';
import { RenderTree } from '@remirror/renderer';
import { memoize } from 'lodash';

const EditorLayout: FunctionComponent = () => {
  const [json, setJson] = useState(JSON.stringify(initialJson, null, 2));

  const onChange: RemirrorEventListener = ({ getJSON }) => {
    const newJson = JSON.stringify(getJSON(), null, 2);
    setJson(newJson);
  };

  const runAction = memoize(
    (method: () => void): MouseEventHandler<HTMLElement> => e => {
      e.preventDefault();
      method();
    },
  );

  return (
    <div
      style={{
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto 1fr',
        gridTemplateAreas: '"editor" "json"',
      }}
    >
      <div style={{ gridArea: 'editor' }}>
        <Remirror
          attributes={{ 'data-test-id': 'editor-instance' }}
          onChange={onChange}
          placeholder='Start typing for magic...'
          autoFocus={true}
          initialContent={initialJson}
        >
          {({ getMenuProps, actions }) => {
            const menuProps = getMenuProps({
              name: 'floating-menu',
            });
            return (
              <div>
                <div
                  style={{
                    position: 'absolute',
                    top: menuProps.position.top,
                    left: menuProps.position.left,
                  }}
                  ref={menuProps.ref}
                >
                  <button
                    style={{
                      backgroundColor: actions.bold.isActive() ? 'white' : 'pink',
                      fontWeight: actions.bold.isActive() ? 600 : 300,
                    }}
                    disabled={!actions.bold.isEnabled()}
                    onClick={runAction(actions.bold.run)}
                  >
                    B
                  </button>
                  <button
                    style={{
                      backgroundColor: actions.paragraph.isActive() ? 'white' : 'pink',
                      fontWeight: actions.paragraph.isActive() ? 600 : 300,
                    }}
                    disabled={!actions.paragraph.isEnabled()}
                    onClick={runAction(actions.paragraph.run)}
                  >
                    #
                  </button>
                </div>
              </div>
            );
          }}
        </Remirror>
      </div>
      <div>
        <pre
          style={{
            width: '100%',
            height: '50%',
            overflowY: 'auto',
            padding: '1em',
            background: 'black',
            color: 'lawngreen',
          }}
        >
          {json}
        </pre>
      </div>
    </div>
  );
};

export const DocumentModelEditor: FunctionComponent<RemirrorProps> = () => <EditorLayout />;
export const BasicRenderer: FunctionComponent = () => <RenderTree json={initialJson} />;

const initialJson = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Better docs to come soon...',
        },
      ],
    },
    {
      type: 'paragraph',
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'However for now it is important that something is in place.',
        },
      ],
    },
  ],
};
