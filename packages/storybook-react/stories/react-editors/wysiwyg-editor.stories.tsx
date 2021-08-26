import { useCallback } from 'react';
import { ProsemirrorDevTools } from '@remirror/dev';
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

import { useHelpers, useRemirrorContext } from '../../../remirror__react-core/src';

export default { title: 'Editors / Wysiwyg' };

const SAMPLE_DOC = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: { dir: null, ignoreBidiAutoUpdate: null },
      content: [{ type: 'text', text: 'Loaded content' }],
    },
  ],
};

function LoadButton() {
  const { setContent } = useRemirrorContext();
  const handleClick = useCallback(() => setContent(SAMPLE_DOC), [setContent]);

  return <button onClick={handleClick}>Load</button>;
}

function SaveButton() {
  const { getJSON } = useHelpers();
  const handleClick = useCallback(() => alert(JSON.stringify(getJSON())), [getJSON]);

  return <button onClick={handleClick}>Save</button>;
}

export const Basic = () => {
  return (
    <WysiwygEditor placeholder='Start typing...'>
      <LoadButton />
      <SaveButton />
      <ProsemirrorDevTools />
    </WysiwygEditor>
  );
};
