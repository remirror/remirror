/* tslint:disable:no-implicit-dependencies */

import React, { FunctionComponent } from 'react';

import { Bold, Italic, Underline } from '@remirror/core-extensions';
import { defaultEffect, EpicMode, heartEffect, spawningEffect } from '@remirror/extension-epic-mode';
import { Remirror } from '@remirror/react';

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
    new EpicMode({ particleEffect: spawningEffect }),
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

export const EpicModeHeart: FunctionComponent = () => {
  const extensions = [
    new Bold(),
    new Italic(),
    new Underline(),
    new EpicMode({
      particleEffect: heartEffect,
      shake: false,
      // colors: [
      //   '#DDA3AD',
      //   '#CD7584',
      //   '#CD7584',
      //   '#C55E70',
      //   '#BC475C',
      //   '#B43047',
      //   '#AC1933',
      //   '#A4031F',
      //   '#96031D',
      //   '#87031A',
      //   '#780317',
      //   '#690214',
      //   '#5A0211',
      //   '#4B020F',
      //   '#3C020C',
      // ],
    }),
  ];
  return (
    <div style={{ gridArea: 'editor' }}>
      <Remirror
        attributes={{ 'data-test-id': 'editor-instance' }}
        placeholder='A note to a lover...'
        extensions={extensions}
      >
        {() => <div />}
      </Remirror>
    </div>
  );
};
