import React, { FC, MouseEventHandler, useState } from 'react';

import { memoize } from '@remirror/core';
import {
  BoldExtension,
  ItalicExtension,
  PlaceholderExtension,
  UnderlineExtension,
} from '@remirror/core-extensions';
import {
  bubblePositioner,
  ManagedRemirrorProvider,
  RemirrorEventListener,
  RemirrorExtension,
  RemirrorManager,
  useRemirrorContext,
} from '@remirror/react';

type SimpleExtensions = BoldExtension | ItalicExtension | PlaceholderExtension | UnderlineExtension;

const SillyMenu: FC = () => {
  const { getPositionerProps, actions } = useRemirrorContext<SimpleExtensions>();

  const runAction = memoize(
    (method: () => void): MouseEventHandler<HTMLElement> => e => {
      e.preventDefault();
      method();
    },
  );

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
          style={{
            backgroundColor: actions.bold.isActive() ? 'white' : 'pink',
            fontWeight: actions.bold.isActive() ? 600 : 300,
          }}
          disabled={!actions.bold.isEnabled()}
          onClick={runAction(actions.bold)}
        >
          b
        </button>
        <button
          style={{
            backgroundColor: actions.italic.isActive() ? 'white' : 'pink',
            fontWeight: actions.italic.isActive() ? 600 : 300,
          }}
          disabled={!actions.italic.isEnabled()}
          onClick={runAction(actions.italic)}
        >
          i
        </button>
        <button
          style={{
            backgroundColor: actions.underline.isActive() ? 'white' : 'pink',
            fontWeight: actions.underline.isActive() ? 600 : 300,
          }}
          disabled={!actions.underline.isEnabled()}
          onClick={runAction(actions.underline)}
        >
          u
        </button>
      </div>
    </div>
  );
};

export default () => {
  const [json, setJson] = useState(JSON.stringify(initialJson, null, 2));

  const onChange: RemirrorEventListener<SimpleExtensions> = ({ getJSON }) => {
    const newJson = JSON.stringify(getJSON(), null, 2);
    setJson(newJson);
  };

  return (
    <div
      style={{
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto 1fr',
        gridTemplateAreas: '"editor" "json"',
      }}
    >
      <div style={{ gridArea: 'editor' }}>
        <RemirrorManager>
          <RemirrorExtension Constructor={BoldExtension} />
          <RemirrorExtension Constructor={PlaceholderExtension} placeholder='Start typing for magic...' />
          <RemirrorExtension Constructor={ItalicExtension} />
          <RemirrorExtension Constructor={UnderlineExtension} />
          <ManagedRemirrorProvider
            attributes={{ 'data-testid': 'editor-instance' }}
            onChange={onChange}
            autoFocus={true}
            initialContent={initialJson}
          >
            <SillyMenu />
          </ManagedRemirrorProvider>
        </RemirrorManager>
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
