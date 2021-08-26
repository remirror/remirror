import '../example.css';

import BrowserOnly from '@docusaurus/BrowserOnly';
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

const Editor = () => {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => <WysiwygEditor placeholder='Enter text...' />}
    </BrowserOnly>
  );
};

export default Editor;
