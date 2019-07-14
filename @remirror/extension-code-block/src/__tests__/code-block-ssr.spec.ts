/**
 * @jest-environment node
 */

import { renderSSREditor } from 'jest-remirror';
import { CodeBlockExtension, CodeBlockExtensionOptions } from '../';

import javascript from 'refractor/lang/javascript';
import markdown from 'refractor/lang/markdown';
import typescript from 'refractor/lang/typescript';

const supportedLanguages = [typescript, javascript, markdown];
const create = (params: CodeBlockExtensionOptions = {}) =>
  renderSSREditor([new CodeBlockExtension({ ...params, supportedLanguages })], { initialContent });

test('ssr component', () => {
  expect(create()).toInclude('<pre class="language-markup"><code>Simple Code Blocks');
  expect(create()).toMatchSnapshot();
});

const initialContent = {
  type: 'doc',
  content: [
    {
      type: 'codeBlock',
      content: [
        {
          type: 'text',
          text:
            'Simple Code Blocks\necho "fun times"\nUse Shift-Enter or Mod-Enter to hard break out of the code block',
        },
      ],
    },
  ],
};
