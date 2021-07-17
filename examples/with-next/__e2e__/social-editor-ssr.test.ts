import { smokeTest, ssrTest } from 'testing/playwright';

const path = 'editor/social';

smokeTest(path);
ssrTest('social without content', path);
ssrTest('social with content', 'editor/social/content');
