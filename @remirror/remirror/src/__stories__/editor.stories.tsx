/* tslint:disable:no-implicit-dependencies */

import React, { FunctionComponent, MouseEventHandler, useState } from 'react';

import { Mentions } from '@remirror/mentions-extension';
import { Remirror, RemirrorEventListener } from '@remirror/react';
import { RenderTree } from '@remirror/renderer';
import { storiesOf } from '@storybook/react';
import { isEqual, memoize } from 'lodash';

const EditorLayout: FunctionComponent = () => {
  const [json, setJson] = useState(JSON.stringify(initialJson, null, 2));

  const onChange: RemirrorEventListener = ({ getJSON, view }) => {
    const newJson = JSON.stringify(getJSON(), null, 2);
    console.log(
      'onChange has been called',
      isEqual(json, newJson),
      isEqual(view.state.doc.toJSON(), getJSON()),
    );
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
          extensions={[
            new Mentions({
              onKeyDown: arg => {
                console.log('Mentions is being called', arg);
                return false;
              },
            }),
          ]}
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

storiesOf('Editor', module)
  .add('Basic', () => <EditorLayout />)
  .add('With Provider', () => <EditorLayout />)
  .add('Rendered', () => <RenderTree json={initialJson} />);

// const initialJson = {
//   type: 'doc',
//   content: [
//     {
//       type: 'paragraph',
//       content: [],
//     },
//   ],
// };

const initialJson = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This a lot of text that can later be deleted.',
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
          text: 'However for now it is important. ',
        },
      ],
    },
  ],
};
