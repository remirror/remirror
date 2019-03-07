/* tslint:disable:no-implicit-dependencies */

import React, { FunctionComponent } from 'react';

import { Bold, Italic, Underline } from '@remirror/core-extensions';
import { defaultEffect, EpicMode, spawningEffect } from '@remirror/extension-epic-mode';
import { Remirror } from '@remirror/react';

export const EpicModeDefault: FunctionComponent = () => {
  const extensions = [
    new Bold(),
    new Italic(),
    new Underline(),
    new EpicMode({ particleEffect: defaultEffect, particleRange: { min: 1, max: 100 } }),
  ];
  return (
    <div style={{ gridArea: 'editor' }}>
      <Remirror
        autoFocus={true}
        attributes={{ 'data-test-id': 'editor-instance' }}
        placeholder='Start typing for epicness...'
        extensions={extensions}
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
    new EpicMode({ particleEffect: spawningEffect, particleRange: { min: 1, max: 30 } }),
  ];
  return (
    <div style={{ gridArea: 'editor' }}>
      <Remirror
        attributes={{ 'data-test-id': 'editor-instance' }}
        placeholder='Start typing for epicness...'
        extensions={extensions}
      >
        {() => <div />}
      </Remirror>
    </div>
  );
};
