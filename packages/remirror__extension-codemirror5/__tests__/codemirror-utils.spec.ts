import { loadCodeMirror } from '../src/codemirror-ref';
import { parseLanguageToMode } from '../src/codemirror-utils';

describe('parseLanguageToMode', () => {
  beforeAll(async () => {
    await loadCodeMirror();
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
