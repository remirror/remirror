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
  LinkOptions,
  ListItem,
  OrderedList,
  Strike,
  Underline,
} from '@remirror/core-extensions';
import { ManagedRemirrorEditor, RemirrorExtension, RemirrorManager, useRemirror } from '@remirror/react';
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
          <RemirrorExtension Constructor={Bold} />
          <RemirrorExtension Constructor={Underline} />
          <RemirrorExtension Constructor={Italic} />
          <RemirrorExtension Constructor={Blockquote} />
          <RemirrorExtension<LinkOptions> Constructor={Link} activationHandler={this.activateLink} />
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
          <ManagedRemirrorEditor {...props} customRootProp={true}>
            <InnerEditor
              linkActivated={this.state.linkActivated}
              deactivateLink={this.deactivateLink}
              activateLink={this.activateLink}
            />
          </ManagedRemirrorEditor>
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
