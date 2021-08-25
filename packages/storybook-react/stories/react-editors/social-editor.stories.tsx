import { ProsemirrorDevTools } from '@remirror/dev';
import { SocialEditor } from '@remirror/react-editors/social';

export default { title: 'Editors / Social' };

const ALL_USERS = [
  { id: 'joe', label: 'Joe' },
  { id: 'sue', label: 'Sue' },
  { id: 'pat', label: 'Pat' },
  { id: 'tom', label: 'Tom' },
  { id: 'jim', label: 'Jim' },
];

const TAGS = ['editor', 'remirror', 'opensource', 'prosemirror'];

export const Basic = () => {
  return (
    <SocialEditor placeholder='Mention @joe or add #remirror' users={ALL_USERS} tags={TAGS}>
      <ProsemirrorDevTools />
    </SocialEditor>
  );
};
