import {
  Blockquote,
  Bold,
  BulletList,
  Code,
  CodeBlock,
  HardBreak,
  Heading,
  HorizontalRule,
  Image,
  Italic,
  Link,
  ListItem,
  OrderedList,
  Strike,
  Underline,
} from '@remirror/core-extensions';
import {
  ManagedRemirrorEditor,
  RemirrorExtension,
  RemirrorManager,
  RemirrorProps,
  useRemirrorContext,
} from '@remirror/react';
import deepMerge from 'deepmerge';
import { ThemeProvider } from 'emotion-theming';
import React, { FC } from 'react';
import { uiWysiwygTheme } from '../theme';
import { WysiwygUIProps } from '../types';
import { MenuBar } from './menu-bar';
import { InnerEditorWrapper } from './styled';

const defaultPlaceholder: RemirrorProps['placeholder'] = [
  'Start editing...',
  {
    color: '#aab8c2',
    fontStyle: 'normal',
    position: 'absolute',
    fontWeight: 300,
    letterSpacing: '0.5px',
  },
];

export const WysiwygUI: FC<WysiwygUIProps> = ({
  autoFocus = true,
  placeholder = defaultPlaceholder,
  theme = {},
}) => {
  const editorTheme = deepMerge(uiWysiwygTheme, theme);

  return (
    <ThemeProvider theme={editorTheme}>
      <RemirrorManager>
        <RemirrorExtension Constructor={Bold} />
        <RemirrorExtension Constructor={Underline} />
        <RemirrorExtension Constructor={Italic} />
        <RemirrorExtension Constructor={Blockquote} />
        <RemirrorExtension Constructor={Link} />
        <RemirrorExtension Constructor={Strike} />
        <RemirrorExtension Constructor={Code} />
        <RemirrorExtension Constructor={Heading} />
        <RemirrorExtension Constructor={HorizontalRule} />
        <RemirrorExtension Constructor={Image} />
        <RemirrorExtension Constructor={ListItem} />
        <RemirrorExtension Constructor={BulletList} />
        <RemirrorExtension Constructor={OrderedList} />
        <RemirrorExtension Constructor={HardBreak} />
        <RemirrorExtension Constructor={CodeBlock} />
        <ManagedRemirrorEditor autoFocus={autoFocus} placeholder={placeholder} customRootProp={true}>
          <InnerEditor />
        </ManagedRemirrorEditor>
      </RemirrorManager>
    </ThemeProvider>
  );
};

const InnerEditor = () => {
  const { getRootProps } = useRemirrorContext();

  return (
    <div>
      <MenuBar />
      <InnerEditorWrapper {...getRootProps()} />
    </div>
  );
};
