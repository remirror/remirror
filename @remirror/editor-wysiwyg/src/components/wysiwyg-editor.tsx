import { deepMerge, RemirrorTheme } from '@remirror/core';
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  HorizontalRuleExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  OrderedListExtension,
  ParagraphExtension,
  PlaceholderExtension,
  SSRHelperExtension,
  StrikeExtension,
  TrailingNodeExtension,
  UnderlineExtension,
} from '@remirror/core-extensions';
import { CodeBlockExtension } from '@remirror/extension-code-block';
import { DropCursorExtension } from '@remirror/extension-drop-cursor';
import { ImageExtension } from '@remirror/extension-image';
import {
  ManagedRemirrorProvider,
  RemirrorExtension,
  RemirrorManager,
  useRemirrorContext,
} from '@remirror/react';
import { RemirrorThemeProvider } from '@remirror/ui';
import React, { FC, useMemo, useState } from 'react';
import { wysiwygEditorTheme } from '../wysiwyg-theme';
import { WysiwygEditorProps, WysiwygExtensions } from '../wysiwyg-types';
import { EditorWrapper } from './wysiwyg-components';
import { BubbleMenu, BubbleMenuProps, MenuBar } from './wysiwyg-menu';

import bash from 'refractor/lang/bash';
import markdown from 'refractor/lang/markdown';
import tsx from 'refractor/lang/tsx';
import typescript from 'refractor/lang/typescript';

const defaultPlaceholder = 'Start typing...';
const DEFAULT_LANGUAGES = [markdown, typescript, tsx, bash];

export const WysiwygEditor: FC<WysiwygEditorProps> = ({
  placeholder = defaultPlaceholder,
  theme = Object.create(null),
  supportedLanguages: supportedLanguagesProp = [],
  syntaxTheme = 'atomDark',
  defaultLanguage,
  formatter,
  children,
  ...props
}) => {
  // Manages whether there is a floating link dialog within the editor..
  const [linkActivated, setLinkActivated] = useState(false);

  const activateLink = () => {
    setLinkActivated(true);
  };

  const deactivateLink = () => {
    setLinkActivated(false);
  };

  const editorTheme = useMemo(() => deepMerge<RemirrorTheme>(wysiwygEditorTheme, theme), [theme]);
  const supportedLanguages = [...DEFAULT_LANGUAGES, ...supportedLanguagesProp];

  return (
    <RemirrorThemeProvider theme={editorTheme}>
      <RemirrorManager>
        <RemirrorExtension
          Constructor={PlaceholderExtension}
          placeholderStyle={{
            color: '#aaa',
            fontStyle: 'normal',
            position: 'absolute',
            fontWeight: 300,
            letterSpacing: '0.5px',
          }}
          placeholder={placeholder}
        />
        <RemirrorExtension Constructor={ParagraphExtension} />
        <RemirrorExtension Constructor={DropCursorExtension} priority={1} />
        <RemirrorExtension Constructor={BoldExtension} />
        <RemirrorExtension Constructor={UnderlineExtension} />
        <RemirrorExtension Constructor={ItalicExtension} />
        <RemirrorExtension Constructor={BlockquoteExtension} />
        <RemirrorExtension Constructor={LinkExtension} activationHandler={activateLink} priority={1} />
        <RemirrorExtension Constructor={StrikeExtension} />
        <RemirrorExtension Constructor={CodeExtension} />
        <RemirrorExtension Constructor={HeadingExtension} />
        <RemirrorExtension Constructor={HorizontalRuleExtension} />
        <RemirrorExtension Constructor={ImageExtension} />
        <RemirrorExtension Constructor={ListItemExtension} />
        <RemirrorExtension Constructor={BulletListExtension} />
        <RemirrorExtension Constructor={OrderedListExtension} />
        <RemirrorExtension Constructor={HardBreakExtension} />
        <RemirrorExtension Constructor={TrailingNodeExtension} />
        <RemirrorExtension
          Constructor={CodeBlockExtension}
          supportedLanguages={supportedLanguages}
          formatter={formatter}
          syntaxTheme={syntaxTheme}
          defaultLanguage={defaultLanguage}
        />
        <RemirrorExtension Constructor={SSRHelperExtension} />
        <ManagedRemirrorProvider {...props}>
          <>
            <InnerEditor
              linkActivated={linkActivated}
              deactivateLink={deactivateLink}
              activateLink={activateLink}
            />
            {children}
          </>
        </ManagedRemirrorProvider>
      </RemirrorManager>
    </RemirrorThemeProvider>
  );
};

/**
 * The internal editor responsible for the editor layout and ui.
 * Any component rendered has access to the remirror context.
 */
const InnerEditor: FC<BubbleMenuProps> = ({ linkActivated, deactivateLink, activateLink }) => {
  const { getRootProps } = useRemirrorContext<WysiwygExtensions>();

  return (
    <EditorWrapper>
      <MenuBar activateLink={activateLink} />
      <BubbleMenu linkActivated={linkActivated} deactivateLink={deactivateLink} activateLink={activateLink} />
      <div {...getRootProps()} data-testid='remirror-wysiwyg-editor' />
    </EditorWrapper>
  );
};
