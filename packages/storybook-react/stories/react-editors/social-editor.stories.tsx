import { useCallback } from 'react';
import { SocialEditor } from '@remirror/react-editors/social';

import { useHelpers, useRemirrorContext } from '../../../remirror__react-core/src';

export default { title: 'Editors / Social' };

const ALL_USERS = [
  { id: 'joe', label: 'Joe' },
  { id: 'sue', label: 'Sue' },
  { id: 'pat', label: 'Pat' },
  { id: 'tom', label: 'Tom' },
  { id: 'jim', label: 'Jim' },
];

const TAGS = ['editor', 'remirror', 'opensource', 'prosemirror'];

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
    <SocialEditor placeholder='Mention @joe or add #remirror' users={ALL_USERS} tags={TAGS}>
      <LoadButton />
      <SaveButton />
    </SocialEditor>
  );
};
