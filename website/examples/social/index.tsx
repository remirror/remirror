import '../example.css';

import { SocialEditor } from '@remirror/react-editors/social';

const ALL_USERS = [
  { id: 'joe', label: 'Joe' },
  { id: 'sue', label: 'Sue' },
  { id: 'pat', label: 'Pat' },
  { id: 'tom', label: 'Tom' },
  { id: 'jim', label: 'Jim' },
];

const TAGS = ['editor', 'remirror', 'opensource', 'prosemirror'];

const Editor = () => {
  return <SocialEditor placeholder='Mention @joe or add #remirror' users={ALL_USERS} tags={TAGS} />;
};

export default Editor;
