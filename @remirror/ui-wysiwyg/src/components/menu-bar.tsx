import React, { MouseEventHandler } from 'react';

import { Attrs, memoize } from '@remirror/core';
import { useRemirrorContext } from '@remirror/react';

const menuItems: Array<[string, string, Attrs?]> = [
  ['bold', 'b'],
  ['italic', 'i'],
  ['underline', 'u'],
  ['heading', 'h1', { level: 1 }],
  ['heading', 'h2', { level: 2 }],
  ['heading', 'h3', { level: 3 }],
];

const runAction = memoize(
  (method: (attrs?: Attrs) => void, attrs?: Attrs): MouseEventHandler<HTMLElement> => e => {
    e.preventDefault();
    method(attrs);
  },
);

export const MenuBar = () => {
  const { actions } = useRemirrorContext();
  console.log('actions', actions);

  return (
    <div>
      {menuItems.map(([name, desc, attrs], index) => {
        console.log(name, desc, attrs);
        return (
          <button
            key={index}
            style={{
              backgroundColor: actions[name].isActive() ? 'white' : 'pink',
              fontWeight: actions[name].isActive() ? 600 : 300,
            }}
            disabled={!actions[name].isEnabled()}
            onClick={runAction(actions[name].command, attrs)}
          >
            {desc}
          </button>
        );
      })}
    </div>
  );
};
