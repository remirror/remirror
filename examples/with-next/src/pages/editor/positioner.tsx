import { FC } from 'react';
import {
  BoldExtension,
  BulletListExtension,
  HeadingExtension,
  ItalicExtension,
  OrderedListExtension,
  UnderlineExtension,
} from 'remirror/extensions';
import {
  FloatingWrapper,
  Remirror,
  ThemeProvider,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';

const extensions = () => [
  new HeadingExtension(),
  new BoldExtension(),
  new ItalicExtension(),
  new UnderlineExtension(),
  new BulletListExtension(),
  new OrderedListExtension(),
];

function FloatingButtons() {
  const { commands, active } = useRemirrorContext({
    autoUpdate: true,
  });

  // The use positioner hook allows for tracking the current selection in the editor.

  return (
    <FloatingWrapper positioner='cursor' placement='top'>
      <button
        onClick={() => commands.toggleBold()}
        style={{ fontWeight: active.bold() ? 'bold' : undefined }}
        data-testid='bubble-menu-bold'
      >
        Bold
      </button>
      <button
        onClick={() => commands.toggleItalic()}
        style={{ fontWeight: active.italic() ? 'bold' : undefined }}
      >
        Italic
      </button>
      <button
        onClick={() => commands.toggleUnderline()}
        style={{ fontWeight: active.underline() ? 'bold' : undefined }}
      >
        Underline
      </button>
    </FloatingWrapper>
  );
}

const SmallEditorContainer: FC = () => {
  const { manager, state, onChange } = useRemirror({ extensions });

  return (
    <ThemeProvider>
      <Remirror manager={manager} state={state} onChange={onChange} autoRender>
        <FloatingButtons />
      </Remirror>
    </ThemeProvider>
  );
};

export default SmallEditorContainer;
