import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  HorizontalRuleExtension,
  ImageExtension,
  ItalicExtension,
  LinkExtension,
  LinkExtensionOptions,
  ListItemExtension,
  OrderedListExtension,
  StrikeExtension,
  UnderlineExtension,
} from '@remirror/core-extensions';
import { ManagedRemirrorProvider, RemirrorExtension, RemirrorManager, useRemirror } from '@remirror/react';
import { asDefaultProps, RemirrorManagerProps } from '@remirror/react-utils';
import deepMerge from 'deepmerge';
import { ThemeProvider } from 'emotion-theming';
import React, { FC, PureComponent } from 'react';
import { uiWysiwygTheme } from '../theme';
import { WysiwygUIProps } from '../types';
import { BubbleMenu, BubbleMenuProps, MenuBar } from './menu';
import { EditorWrapper, InnerEditorWrapper } from './styled';

const defaultPlaceholder: RemirrorManagerProps['placeholder'] = [
  'Start editing...',
  {
    color: '#aaa',
    fontStyle: 'normal',
    position: 'absolute',
    fontWeight: 300,
    letterSpacing: '0.5px',
  },
];

interface State {
  linkActivated: boolean;
}

export class WysiwygUI extends PureComponent<WysiwygUIProps> {
  public static defaultProps = asDefaultProps<WysiwygUIProps>()({
    placeholder: defaultPlaceholder,
    theme: {},
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
    return deepMerge(uiWysiwygTheme, this.props.theme || {});
  }

  public render() {
    const { theme: _, placeholder, ...props } = this.props;

    return (
      <ThemeProvider theme={this.editorTheme}>
        <RemirrorManager placeholder={placeholder}>
          <RemirrorExtension Constructor={BoldExtension} />
          <RemirrorExtension Constructor={UnderlineExtension} />
          <RemirrorExtension Constructor={ItalicExtension} />
          <RemirrorExtension Constructor={BlockquoteExtension} />
          <RemirrorExtension<LinkExtensionOptions>
            Constructor={LinkExtension}
            activationHandler={this.activateLink}
          />
          <RemirrorExtension Constructor={StrikeExtension} />
          <RemirrorExtension Constructor={CodeExtension} />
          <RemirrorExtension Constructor={HeadingExtension} />
          <RemirrorExtension Constructor={HorizontalRuleExtension} />
          <RemirrorExtension Constructor={ImageExtension} />
          <RemirrorExtension Constructor={ListItemExtension} />
          <RemirrorExtension Constructor={BulletListExtension} />
          <RemirrorExtension Constructor={OrderedListExtension} />
          <RemirrorExtension Constructor={HardBreakExtension} />
          <RemirrorExtension Constructor={CodeBlockExtension} />
          <ManagedRemirrorProvider {...props}>
            <InnerEditor
              linkActivated={this.state.linkActivated}
              deactivateLink={this.deactivateLink}
              activateLink={this.activateLink}
            />
          </ManagedRemirrorProvider>
        </RemirrorManager>
      </ThemeProvider>
    );
  }
}

const InnerEditor: FC<BubbleMenuProps> = ({ linkActivated, deactivateLink, activateLink }) => {
  const { getRootProps } = useRemirror();

  return (
    <EditorWrapper>
      <MenuBar activateLink={activateLink} />
      <BubbleMenu linkActivated={linkActivated} deactivateLink={deactivateLink} activateLink={activateLink} />
      <InnerEditorWrapper {...getRootProps()} />
    </EditorWrapper>
  );
};
