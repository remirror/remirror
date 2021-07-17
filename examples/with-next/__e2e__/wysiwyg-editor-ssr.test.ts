import { smokeTest, ssrTest } from 'testing/playwright';

const path = 'editor/wysiwyg';

smokeTest(path);
ssrTest('wysiwyg without content', path);
ssrTest('wysiwyg with content', 'editor/wysiwyg/content');
