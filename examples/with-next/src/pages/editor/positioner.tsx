import { FC } from 'react';
import {
  BoldExtension,
  BulletListExtension,
  HeadingExtension,
  ItalicExtension,
  OrderedListExtension,
  UnderlineExtension,
} from 'remirror/extensions';
import { Remirror, usePositioner, useRemirror, useRemirrorContext } from 'remirror/react';

const extensions = () => [
  new HeadingExtension(),
  new BoldExtension(),
  new ItalicExtension(),
  new UnderlineExtension(),
  new BulletListExtension(),
  new OrderedListExtension(),
];

function Menu() {
  const { commands, active } = useRemirrorContext({
    autoUpdate: true,
  });

  // The use positioner hook allows for tracking the current selection in the editor.
  const { bottom, left, ref } = usePositioner('bubble');

  return (
    <div ref={ref} style={{ bottom, left, position: 'absolute' }} data-testid='bubble-menu'>
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
    </div>
  );
}

const SmallEditorContainer: FC = () => {
  const { manager, state, onChange } = useRemirror({ extensions });

  return (
    <Remirror manager={manager} state={state} onChange={onChange} autoRender>
      <Menu />
    </Remirror>
  );
};

export default SmallEditorContainer;
