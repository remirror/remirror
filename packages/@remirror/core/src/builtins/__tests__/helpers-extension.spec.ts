import { renderEditor } from 'jest-remirror';

import { HeadingExtension, isExtensionValid } from '@remirror/testing';

import { HelpersExtension } from '..';

test('`HelpersExtension`: is valid', () => {
  expect(isExtensionValid(HelpersExtension)).toBeTrue();
});

describe('active', () => {
  it('should recognise active nodes by attrs', () => {
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
