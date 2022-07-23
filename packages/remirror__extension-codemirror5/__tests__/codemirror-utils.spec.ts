import 'codemirror/mode/meta';

import CodeMirrorPackage from 'codemirror';
import { defaultImport } from 'default-import';

import ref from '../src/codemirror-ref';
import { parseLanguageToMode } from '../src/codemirror-utils';

const CodeMirror = defaultImport(CodeMirrorPackage);

describe('parseLanguageToMode', () => {
  beforeAll(async () => {
    ref.CodeMirror = CodeMirror;
  });

  for (const [inputLanguage, expectedMode] of [
    ['js', 'javascript'],
    ['javascript', 'javascript'],
    ['JavaScript', 'javascript'],
    ['JAVA', 'clike'],
    ['Java', 'clike'],
    ['java', 'clike'],
    ['Kotlin', 'clike'],
    ['ProtoBuf', 'protobuf'],
    ['proto', 'protobuf'],
    ['python', 'python'],
    ['py', 'python'],
    ['', null],
    ['this_language_do_not_exist', null],
  ] as const) {
    it(`can parse "${inputLanguage}"`, () => {
      const parsed = parseLanguageToMode(inputLanguage);
      expect(parsed).toEqual(expectedMode);
    });
  }
});
