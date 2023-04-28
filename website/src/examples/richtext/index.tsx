import '../example.css';

import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

const Editor = () => (
  <BrowserOnly fallback={<div>Loading...</div>}>
    {() => <WysiwygEditor placeholder='Enter text...' />}
  </BrowserOnly>
);

export default Editor;
