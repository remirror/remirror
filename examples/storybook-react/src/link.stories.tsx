import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'reakit/Button';
import {
  BoldExtension,
  createMarkPositioner,
  ItalicExtension,
  LinkExtension,
  MarkdownExtension,
  ShortcutHandlerProps,
} from 'remirror/extensions';
import {
  ControlledDialogComponent,
  FloatingToolbar,
  FloatingWrapper,
  Remirror,
  ThemeProvider,
  useExtension,
  useRemirror,
} from '@remirror/react';

export default { title: 'Link extension' };

export const Basic = (): JSX.Element => {
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
      <ControlledDialogComponent visible={visible} onUpdate={onUpdate} backdrop={true}>
        <Button
          onClick={() => {
            setVisible(false);
          }}
        >
          Hello
        </Button>
      </ControlledDialogComponent>
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
