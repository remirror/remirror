/* tslint:disable:no-implicit-dependencies */

import React, { FunctionComponent, MouseEventHandler, useState } from 'react';

import { memoize } from '@remirror/core';
import { Bold, Italic, Underline } from '@remirror/core-extensions';
import { bubblePositioner, Remirror, RemirrorEventListener, RemirrorProps } from '@remirror/react';
import { RenderTree } from '@remirror/renderer-react';

const EditorLayout: FunctionComponent = () => {
  const extensions = [new Bold(), new Italic(), new Underline()];
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
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto 1fr',
        gridTemplateAreas: '"editor" "json"',
      }}
      id='EditorLayout-grid'
    >
      <div id='EditorLayout-container' style={{ gridArea: 'editor', position: 'relative' }}>
        <Remirror
          attributes={{ 'data-test-id': 'editor-instance' }}
          onChange={onChange}
          placeholder='Start typing for magic...'
          autoFocus={true}
          extensions={extensions}
          initialContent={initialJson}
        >
          {({ getPositionerProps, actions }) => {
            const props = getPositionerProps({
              positionerId: 'bubble',
              ...bubblePositioner,
            });
            return (
              <div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: props.isActive ? props.bottom : -9999,
                    left: props.isActive ? props.left : -9999,
                  }}
                  ref={props.ref}
                >
                  <button
                    key='boldbutton'
                    style={{
                      backgroundColor: actions.bold.isActive() ? 'white' : 'pink',
                      fontWeight: actions.bold.isActive() ? 600 : 300,
                    }}
                    disabled={!actions.bold.isEnabled()}
                    onClick={runAction(actions.bold.command)}
                  >
                    B
                  </button>
                  <button
                    key='italicbutton'
                    style={{
                      backgroundColor: actions.italic.isActive() ? 'white' : 'pink',
                      fontWeight: actions.italic.isActive() ? 600 : 300,
                    }}
                    disabled={!actions.italic.isEnabled()}
                    onClick={runAction(actions.italic.command)}
                  >
                    i
                  </button>
                  <button
                    key='underlinebutton'
                    style={{
                      backgroundColor: actions.underline.isActive() ? 'white' : 'pink',
                      fontWeight: actions.underline.isActive() ? 600 : 300,
                    }}
                    disabled={!actions.underline.isEnabled()}
                    onClick={runAction(actions.underline.command)}
                  >
                    u
                  </button>
                </div>
              </div>
            );
          }}
        </Remirror>
      </div>
      <div
        id='EditorLayout-json'
        style={{
          gridArea: 'json',
          position: 'relative',
          overflowX: 'auto',
          background: 'black',
        }}
      >
        <pre
          style={{
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
            padding: '1em',
            color: 'lawngreen',
            fontFamily: `Consolas, ‘Andale Mono WT’, ‘Andale Mono’,
              ‘Lucida Console’, ‘Lucida Sans Typewriter’, ‘DejaVu Sans Mono’,
              ‘Bitstream Vera Sans Mono’, ‘Liberation Mono’, ‘Nimbus Mono L’,
              Monaco, ‘Courier New’, Courier, monospace`,
          }}
        >
          {json}
        </pre>
      </div>
    </div>
  );
};

const markMap = {
  bold: 'strong',
  italic: 'em',
  code: 'code',
  link: 'a',
  underline: 'u',
};

export const DocumentModelEditor: FunctionComponent<RemirrorProps> = () => <EditorLayout />;
export const BasicRendererReact: FunctionComponent = () => (
  <RenderTree json={initialJson} markMap={markMap} />
);

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
      content: [
        {
          type: 'text',
          text: "I'm ",
        },
        {
          type: 'text',
          marks: [
            {
              type: 'bold',
            },
            {
              type: 'underline',
            },
          ],
          text: 'Bold',
        },
      ],
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
