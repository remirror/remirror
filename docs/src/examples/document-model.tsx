/* tslint:disable:no-implicit-dependencies */

import React, { FunctionComponent, MouseEventHandler, useState } from 'react';

import { Bold, Italic, Underline } from '@remirror/extensions-core';
import { Remirror, RemirrorEventListener, RemirrorProps } from '@remirror/react';
import { RenderTree } from '@remirror/renderer-react';
import { memoize } from 'lodash';

const extensions = [new Bold(), new Italic(), new Underline()];

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
          extensions={extensions}
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
                      backgroundColor: actions.italic.isActive() ? 'white' : 'pink',
                      fontWeight: actions.italic.isActive() ? 600 : 300,
                    }}
                    disabled={!actions.italic.isEnabled()}
                    onClick={runAction(actions.italic.run)}
                  >
                    i
                  </button>
                  <button
                    style={{
                      backgroundColor: actions.underline.isActive() ? 'white' : 'pink',
                      fontWeight: actions.underline.isActive() ? 600 : 300,
                    }}
                    disabled={!actions.underline.isEnabled()}
                    onClick={runAction(actions.underline.run)}
                  >
                    u
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
export const BasicRendererReact: FunctionComponent = () => <RenderTree json={initialJson} />;

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
