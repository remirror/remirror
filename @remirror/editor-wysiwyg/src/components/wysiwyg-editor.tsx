import { config } from '@fortawesome/fontawesome-svg-core';
import { deepMerge } from '@remirror/core';
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
import { ImageExtension } from '@remirror/extension-image';
import { ManagedRemirrorProvider, RemirrorExtension, RemirrorManager, useRemirror } from '@remirror/react';
import { asDefaultProps } from '@remirror/react-utils';
import { ThemeProvider } from 'emotion-theming';
import React, { FC, PureComponent } from 'react';
import { wysiwygEditorTheme } from '../wysiwyg-theme';
import { WysiwygEditorProps, WysiwygExtensionList } from '../wysiwyg-types';
import { EditorWrapper, InnerEditorWrapper } from './wysiwyg-components';
import { BubbleMenu, BubbleMenuProps, MenuBar } from './wysiwyg-menu';

import bash from 'refractor/lang/bash';
import markdown from 'refractor/lang/markdown';
import tsx from 'refractor/lang/tsx';
import typescript from 'refractor/lang/typescript';

const defaultPlaceholder = 'Start typing...';

interface State {
  linkActivated: boolean;
}

// This is need to support FontAwesome in server side rendering
// TODO Refactor to use built in react svg icons
// @see https://github.com/FortAwesome/react-fontawesome/issues/134#issuecomment-486052785
config.autoAddCss = false;

const DEFAULT_LANGUAGES = [markdown, typescript, tsx, bash];

export class WysiwygEditor extends PureComponent<WysiwygEditorProps> {
  public static defaultProps = asDefaultProps<WysiwygEditorProps>()({
    placeholder: defaultPlaceholder,
    theme: {},
    removeFontAwesomeCSS: false,
  });

  public state: State = {
    linkActivated: false,
  };

  private activateLink = () => {
    this.setState({ linkActivated: true });
  };

  private deactivateLink = () => {
    this.setState({ linkActivated: false });
  };

  get editorTheme() {
    return deepMerge(wysiwygEditorTheme, this.props.theme || {});
  }

  get supportedLanguages() {
    return [...DEFAULT_LANGUAGES, ...(this.props.supportedLanguages || [])];
  }

  public render() {
    const {
      theme: _,
      supportedLanguages: _s,
      placeholder,
      removeFontAwesomeCSS,
      defaultLanguage,
      syntaxTheme = 'atomDark',
      formatter,
      children,
      ...props
    } = this.props;

    return (
      <ThemeProvider theme={this.editorTheme}>
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
          <RemirrorExtension Constructor={BoldExtension} />
          <RemirrorExtension Constructor={UnderlineExtension} />
          <RemirrorExtension Constructor={ItalicExtension} />
          <RemirrorExtension Constructor={BlockquoteExtension} />
          <RemirrorExtension Constructor={LinkExtension} activationHandler={this.activateLink} priority={1} />
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
            supportedLanguages={this.supportedLanguages}
            formatter={formatter}
            syntaxTheme={syntaxTheme}
            defaultLanguage={defaultLanguage}
          />
          <RemirrorExtension Constructor={SSRHelperExtension} />
          <ManagedRemirrorProvider {...props}>
            <>
              <InnerEditor
                injectFontAwesome={!removeFontAwesomeCSS}
                linkActivated={this.state.linkActivated}
                deactivateLink={this.deactivateLink}
                activateLink={this.activateLink}
              />
              {children}
            </>
          </ManagedRemirrorProvider>
        </RemirrorManager>
      </ThemeProvider>
    );
  }
}

interface InnerEditorProps extends BubbleMenuProps {
  /**
   * Whether to inject the font awesome styles.
   *
   * @default true
   */
  injectFontAwesome: boolean;
}

const InnerEditor: FC<InnerEditorProps> = ({
  linkActivated,
  deactivateLink,
  activateLink,
  injectFontAwesome,
}) => {
  const { getRootProps } = useRemirror<WysiwygExtensionList>();

  return (
    <EditorWrapper>
      {injectFontAwesome && (
        <link rel='stylesheet' href='https://unpkg.com/@fortawesome/fontawesome-svg-core@1.2.19/styles.css' />
      )}
      <MenuBar activateLink={activateLink} />
      <BubbleMenu linkActivated={linkActivated} deactivateLink={deactivateLink} activateLink={activateLink} />
      <InnerEditorWrapper {...getRootProps()} data-testid='remirror-wysiwyg-editor' />
    </EditorWrapper>
  );
};
