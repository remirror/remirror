/* tslint:disable:no-implicit-dependencies */

import React, { FunctionComponent } from 'react';

import { EDITOR_CLASS_NAME } from '@remirror/core';
import { Bold, Italic, Underline } from '@remirror/core-extensions';
import { defaultEffect, EpicMode, heartEffect, spawningEffect } from '@remirror/extension-epic-mode';
import { Remirror } from '@remirror/react';
import { Interpolation } from 'emotion';

const editorStyles: Interpolation = {
  [`.${EDITOR_CLASS_NAME}`]: {
    border: '1px solid grey',
    minHeight: '50px',
    borderRadius: '10px',
    padding: '10px',
  },
};

export const EpicModeDefault: FunctionComponent = () => {
  const extensions = [
    new Bold(),
    new Italic(),
    new Underline(),
    new EpicMode({ particleEffect: defaultEffect }),
  ];
  return (
    <div style={{ gridArea: 'editor' }}>
      <Remirror
        autoFocus={true}
        attributes={{ 'data-test-id': 'editor-instance' }}
        placeholder='Type for epic...'
        extensions={extensions}
        editorStyles={editorStyles}
      >
        {() => <div />}
      </Remirror>
    </div>
  );
};

export const EpicModeSpawning: FunctionComponent = () => {
  const extensions = [
    new Bold(),
    new Italic(),
    new Underline(),
    new EpicMode({ particleEffect: spawningEffect }),
  ];
  return (
    <div style={{ gridArea: 'editor' }}>
      <Remirror
        attributes={{ 'data-test-id': 'editor-instance' }}
        placeholder='Type for epic...'
        extensions={extensions}
        editorStyles={editorStyles}
      >
        {() => <div />}
      </Remirror>
    </div>
  );
};

export const EpicModeHeart: FunctionComponent = () => {
  const extensions = [
    new Bold(),
    new Italic(),
    new Underline(),
    new EpicMode({
      particleEffect: heartEffect,
      shake: false,
    }),
  ];
  return (
    <div style={{ gridArea: 'editor' }}>
      <Remirror
        attributes={{ 'data-test-id': 'editor-instance' }}
        placeholder='Type for hearts'
        extensions={extensions}
        editorStyles={editorStyles}
      >
        {() => <div />}
      </Remirror>
    </div>
  );
};
