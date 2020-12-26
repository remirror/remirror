import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'reakit/Button';
import { uniqueId } from 'remirror';
import {
  AnnotationExtension,
  BoldExtension,
  createCenteredAnnotationPositioner,
  createMarkPositioner,
  ItalicExtension,
  LinkExtension,
  LinkOptions,
  MarkdownExtension,
  ShortcutHandlerProps,
  UnderlineExtension,
} from 'remirror/extensions';
import {
  ComponentItem,
  ControlledDialog,
  EditorComponent,
  FloatingToolbar,
  FloatingWrapper,
  PositionerComponent,
  Remirror,
  ThemeProvider,
  ToolbarItemUnion,
  useCommands,
  useExtension,
  useHelpers,
  useI18n,
  usePositioner,
  useRemirror,
  useRemirrorContext,
} from 'remirror/react';

export default { title: 'Link extension' };

export const Basic = (args: LinkOptions): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <FloatingLinkToolbar />
      </Remirror>
    </ThemeProvider>
  );
};

function useLinkShortcut(): ShortcutHandlerProps | undefined {
  const [state, setState] = useState<ShortcutHandlerProps | undefined>();

  useExtension(
    LinkExtension,
    ({ addHandler }) => addHandler('onShortcut', (props) => setState(props)),
    [],
  );

  return state;
}

const FloatingLinkToolbar = () => {
  const link = useLinkShortcut();
  const [visible, setVisible] = useState(false);
  const { commands } = useCommands();
  const linkPositioner = useMemo(() => createMarkPositioner({ type: 'link' }), []);
  const onUpdate = useCallback((visible: boolean) => setVisible(visible), []);

  useEffect(() => {
    if (link) {
      setVisible(true);
    }
  }, [link]);

  return (
    <>
      <FloatingToolbar items={[]} positioner={linkPositioner} placement='bottom' />
      <FloatingWrapper positioner={linkPositioner} placement='bottom'>
        {/* {linkPositioner ? `${linkPositioner.}` : ''} */}
      </FloatingWrapper>
      <ControlledDialog visible={visible} onUpdate={onUpdate} backdrop={true}>
        <Button
          onClick={() => {
            setVisible(false);
          }}
        >
          Hello
        </Button>
      </ControlledDialog>
    </>
  );
};

const extensions = () => [
  new BoldExtension(),
  new LinkExtension(),
  new ItalicExtension(),
  new MarkdownExtension(),
];

const content = `This is a link <a href="https://remirror.io" target="_blank">here</a>.\n\n`;

Basic.args = {
  autoLink: true,
  openLinkOnClick: true,
};
