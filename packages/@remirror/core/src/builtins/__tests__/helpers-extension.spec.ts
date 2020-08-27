import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { HeadingExtension } from '@remirror/testing';

import { HelpersExtension } from '..';

extensionValidityTest(HelpersExtension);

describe('active', () => {
  it('should recognize active nodes by attrs', () => {
    const {
      add,
      nodes: { p, doc },
      attributeNodes: { heading: h },
      active,
    } = renderEditor([new HeadingExtension()]);

    add(doc((p('one'), h({ level: 2 })('tw<cursor>o'))));

    expect(active.heading({ level: 2 })).toBeTrue();
    expect(active.heading({ level: 1 })).toBeFalse();
  });
});
