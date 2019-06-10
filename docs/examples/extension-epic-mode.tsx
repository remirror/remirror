import React, { FC, FunctionComponent } from 'react';

import { EDITOR_CLASS_SELECTOR } from '@remirror/core';
import { BoldExtension, ItalicExtension, UnderlineExtension } from '@remirror/core-extensions';
import {
  defaultEffect,
  EpicModeExtension,
  heartEffect,
  ParticleEffect,
  spawningEffect,
} from '@remirror/extension-epic-mode';
import { ManagedRemirrorEditor, RemirrorExtension, RemirrorManager } from '@remirror/react';

const editorStyles = {
  [EDITOR_CLASS_SELECTOR]: {
    border: '1px solid grey',
    minHeight: '50px',
    borderRadius: '10px',
    padding: '10px',
  },
};

interface EpicModeExtensionComponentProps {
  particleEffect: ParticleEffect;
  placeholder?: string;
  shake?: boolean;
}

const EpicModeExtensionComponent: FC<EpicModeExtensionComponentProps> = ({
  particleEffect,
  placeholder = 'Type for epic...',
  shake,
}) => {
  return (
    <div style={{ gridArea: 'editor' }} placeholder={placeholder}>
      <RemirrorManager>
        <RemirrorExtension Constructor={BoldExtension} />
        <RemirrorExtension Constructor={ItalicExtension} />
        <RemirrorExtension Constructor={UnderlineExtension} />
        <RemirrorExtension Constructor={EpicModeExtension} particleEffect={particleEffect} shake={shake} />
        <ManagedRemirrorEditor
          autoFocus={true}
          attributes={{ 'data-test-id': 'editor-instance' }}
          editorStyles={editorStyles}
        />
      </RemirrorManager>
    </div>
  );
};

export const EpicModeExtensionDefault: FunctionComponent = () => (
  <EpicModeExtensionComponent particleEffect={defaultEffect} shake={true} />
);
export const EpicModeExtensionSpawning: FunctionComponent = () => (
  <EpicModeExtensionComponent particleEffect={spawningEffect} shake={true} />
);
export const EpicModeExtensionHeart: FunctionComponent = () => (
  <EpicModeExtensionComponent particleEffect={heartEffect} shake={false} placeholder='Type for hearts' />
);
