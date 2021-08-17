import {
  Callout,
  CodeBlock,
  createIFrameHandler,
  createLinkHandler,
  Doc,
  Heading,
  MarkMap,
  TextHandler,
  ThemeProvider,
} from '@remirror/react';
import { RemirrorRenderer } from '@remirror/react';

import { SAMPLE_DOC } from './sample-doc';

export default { title: 'React Renderer (static HTML)' };

const typeMap: MarkMap = {
  blockquote: 'blockquote',
  bulletList: 'ul',
  callout: Callout,
  codeBlock: CodeBlock,
  doc: Doc,
  hardBreak: 'br',
  heading: Heading,
  horizontalRule: 'hr',
  iframe: createIFrameHandler(),
  image: 'img',
  listItem: 'li',
  paragraph: 'p',
  orderedList: 'ol',
  text: TextHandler,
};

const markMap: MarkMap = {
  italic: 'em',
  bold: 'strong',
  code: 'code',
  link: createLinkHandler({ target: '_blank' }),
  underline: 'u',
};

export const Basic = (): JSX.Element => {
  return (
    <ThemeProvider>
      <RemirrorRenderer json={SAMPLE_DOC} typeMap={typeMap} markMap={markMap} />
    </ThemeProvider>
  );
};
