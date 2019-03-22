/* tslint:disable:no-implicit-dependencies */

import React, { FC, FunctionComponent } from 'react';

import { EDITOR_CLASS_NAME } from '@remirror/core';
import { Bold, Italic, Underline } from '@remirror/core-extensions';
import {
  defaultEffect,
  EpicMode,
  heartEffect,
  ParticleEffect,
  spawningEffect,
} from '@remirror/extension-epic-mode';
import { RemirrorEditor, RemirrorExtension, RemirrorManager } from '@remirror/react';
import { Interpolation } from 'emotion';

const editorStyles: Interpolation = {
  [`.${EDITOR_CLASS_NAME}`]: {
    border: '1px solid grey',
    minHeight: '50px',
    borderRadius: '10px',
    padding: '10px',
  },
};

interface EpicModeComponentProps {
  particleEffect: ParticleEffect;
  placeholder?: string;
  shake?: boolean;
}

const EpicModeComponent: FC<EpicModeComponentProps> = ({
  particleEffect,
  placeholder = 'Type for epic...',
  shake,
}) => {
  return (
    <div style={{ gridArea: 'editor' }}>
      <RemirrorManager>
        <RemirrorExtension Constructor={Bold} />
        <RemirrorExtension Constructor={Italic} />
        <RemirrorExtension Constructor={Underline} />
        <RemirrorExtension Constructor={EpicMode} particleEffect={particleEffect} shake={shake} />
        <RemirrorEditor
          autoFocus={true}
          attributes={{ 'data-test-id': 'editor-instance' }}
          placeholder={placeholder}
          editorStyles={editorStyles}
        />
      </RemirrorManager>
    </div>
  );
};

export const EpicModeDefault: FunctionComponent = () => <EpicModeComponent particleEffect={defaultEffect} />;
export const EpicModeSpawning: FunctionComponent = () => (
  <EpicModeComponent particleEffect={spawningEffect} />
);
export const EpicModeHeart: FunctionComponent = () => (
  <EpicModeComponent particleEffect={heartEffect} shake={false} placeholder='Type for hearts' />
);
