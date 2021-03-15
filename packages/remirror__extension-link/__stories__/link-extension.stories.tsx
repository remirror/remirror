import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Input,
  unstable_Form as Form,
  unstable_FormInput as FormInput,
  unstable_FormLabel as FormLabel,
  unstable_FormMessage as FormMessage,
  unstable_FormSubmitButton as FormSubmitButton,
  unstable_useFormState as useFormState,
} from 'reakit';
import {
  BoldExtension,
  createMarkPositioner,
  ItalicExtension,
  LinkExtension,
  MarkdownExtension,
  MentionAtomExtension,
  ShortcutHandlerProps,
} from 'remirror/extensions';
import { isEmptyObject } from '@remirror/core';
import {
  Button,
  ControlledDialogComponent,
  FloatingToolbar,
  FloatingWrapper,
  Icon,
  Remirror,
  ThemeProvider,
  useAttrs,
  useChainedCommands,
  useCommands,
  useEditorView,
  useExtension,
  useRemirror,
  useSelectedText,
  useSuggest,
} from '@remirror/react';

export default { title: 'Link Extension' };

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

const Suggester = () => {
  const view = useEditorView();
  const { change } = useSuggest({ char: '/', name: 'command' });

  if (!change) {
    return null;
  }

  const coords = view.coordsAtPos(change.range.from);

  return (
    <div>
      Show suggest at {coords.left}/{coords.top} - &quot;{change.query.full}&quot;
    </div>
  );
};

function useLinkFormState(props: LinkFormProps) {
  const chained = useChainedCommands();
  const text = useSelectedText() ?? '';
  const url = (useAttrs().link()?.href as string) ?? '';
  const values = useMemo(() => ({ text, url }), [text, url]);

  return useFormState({
    values,
    resetOnSubmitSucceed: true,
    onValidate: (values) => {
      const errors: { text?: string; url?: string } = {};

      if (!values.text) {
        errors.text = 'Please provide a value for the link text.';
      }

      if (!values.url) {
        errors.url = 'Please provide a value for the link URL';
      }

      if (!isEmptyObject(errors)) {
        throw errors;
      }
    },
    onSubmit: ({ url, text }) => {
      chained.updateLink({ href: url, auto: false }).replaceText({ content: text }).run();
      props.onSubmit();
    },
  });
}

interface LinkFormProps {
  onSubmit: () => void;
}
const LinkForm = (props: LinkFormProps) => {
  const formState = useLinkFormState(props);

  return (
    // <input autoFocus />
    <Form {...formState}>
      <FormLabel {...formState} name='text'>
        Text
      </FormLabel>
      <FormInput {...formState} name='text' placeholder='Text' autoFocus />
      {/* <Input name='url' /> */}
      <FormMessage {...formState} name='text' />
      <FormLabel {...formState} name='text'>
        Link
      </FormLabel>
      <FormInput {...formState} name='url' placeholder='Link' />
      <FormMessage {...formState} name='url' />
      <FormSubmitButton {...formState}>Submit</FormSubmitButton>
    </Form>
  );
};

function useFloatingLinkState() {
  const { removeLink, focus } = useCommands();
  const link = useLinkShortcut();

  const [visible, setVisible] = useState(false);
  const linkPositioner = useMemo(() => createMarkPositioner({ type: 'link' }), []);
  const onUpdateVisibility = useCallback((visible: boolean) => {
    // if (!visible) {
    //   focus();
    // }

    return setVisible(visible);
  }, []);

  const onRemove = useCallback(() => {
    return removeLink();
  }, [removeLink]);

  useEffect(() => {
    if (link) {
      setVisible(true);
    }
  }, [link]);

  return useMemo(
    () => ({
      linkPositioner,
      visible,
      onUpdateVisibility,
      setVisible,
      onRemove,
    }),
    [linkPositioner, visible, onUpdateVisibility, onRemove],
  );
}

const FloatingLinkToolbar = () => {
  const {
    linkPositioner,
    onUpdateVisibility,
    setVisible,
    visible,
    onRemove,
  } = useFloatingLinkState();

  return (
    <>
      <FloatingWrapper positioner={linkPositioner} placement='bottom'>
        <Button
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            return setVisible(true);
          }}
        >
          <Icon name='pencilLine' />
        </Button>
        <Button onClick={onRemove}>
          <Icon name='linkUnlink' />
        </Button>
      </FloatingWrapper>
      {/* <ControlledDialogComponent visible={visible} onUpdate={onUpdateVisibility} backdrop={true}>
        <LinkForm onSubmit={() => setVisible(false)}  />
      </ControlledDialogComponent> */}
      {visible && <LinkForm onSubmit={() => setVisible(false)} />}
    </>
  );
};

const extensions = () => [
  new BoldExtension(),
  new LinkExtension({ autoLink: true }),
  new ItalicExtension(),
  new MarkdownExtension(),
  new MentionAtomExtension({
    matchers: [{ name: 'at', char: '@', appendText: ' ' }],
  }),
];

const content = `This is a link <a href="https://remirror.io" target="_blank">here</a>.\n\n`;

Basic.args = {
  autoLink: true,
  openLinkOnClick: true,
};
