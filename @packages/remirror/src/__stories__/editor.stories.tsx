import React, { FunctionComponent, useState } from 'react';

import { storiesOf } from '@storybook/react';
import { Remirror, RemirrorEventListener, RenderTree } from '../';
import { Mention } from '../config/nodes';

const EditorLayout: FunctionComponent = () => {
  const [json, setJson] = useState(JSON.stringify(initialJson, null, 2));

  const onChange: RemirrorEventListener = ({ getJSON }) => {
    setJson(JSON.stringify(getJSON(), null, 2));
  };

  return (
    <div
      style={{
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto 1fr',
        gridTemplateAreas: '"editor" "json"',
      }}
    >
      <style>
        {`
      .ProseMirror {
        padding: 10px;
        background: #fffeee;
        min-height: 200px;
      }

      .ProseMirror:focus {
        outline: none;
      }`}
      </style>
      <div style={{ gridArea: 'editor' }}>
        <Remirror
          onChange={onChange}
          placeholder='This is a placeholder'
          autoFocus={true}
          initialContent={initialJson}
          extensions={[
            new Mention({
              onKeyDown: arg => {
                // tslint:disable-next-line:no-console
                console.log(arg);
                return false;
              },
            }),
          ]}
        >
          {({ getMenuProps }) => {
            const menuProps = getMenuProps({
              name: 'floating-menu',
              offset: {
                // top: pos => pos.top,
                // bottom: pos => pos.bottom,
                // left: pos => pos.left,
                // right: pos => pos.right,
              },
            });
            return (
              <div>
                <div
                  ref={menuProps.ref}
                  style={{
                    position: 'absolute',
                    top: menuProps.position.top,
                    left: menuProps.position.left,
                    height: 10,
                    width: 10,
                    backgroundColor: 'red',
                  }}
                />
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
