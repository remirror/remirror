import React from 'react';
import {
  getElementProps,
  isManagedRemirrorProvider,
  isReactDOMElement,
  isRemirrorExtension,
  isRemirrorProvider,
  uniqueClass,
  updateChildWithKey,
} from '../helpers';
import { RemirrorElementType, RemirrorFC } from '../types';

test('getElementProps', () => {
  const expected = { id: 'test' };
  const Element = <div {...expected} />;
  expect(getElementProps(Element)).toEqual(expected);
});

describe('updateChildWithKey', () => {
  it('handles simple use cases', () => {
    expect.assertions(2);
    const original = <div key='test' />;
    const expected = <div key='test' id='updated' />;
    const element = <div>{original}</div>;
    const fn = (child: JSX.Element) => {
      expect(child).toEqual(original);
      return expected;
    };

    expect(updateChildWithKey(element, 'test', fn)[0]).toMatchInlineSnapshot(`
      <div
        id="updated"
      />
    `);
  });

  it('handles nested use cases', () => {
    expect.assertions(2);
    const original = <div key='test' />;
    const expected = <div key='test' id='updated' />;
    const element = <div>{original}</div>;
    const fn = (child: JSX.Element) => {
      expect(child).toEqual(original);
      return expected;
    };

    expect(updateChildWithKey(element, 'test', fn)[0]).toMatchInlineSnapshot(`
      <div
        id="updated"
      />
    `);
  });
});

test('isReactDOMElement', () => {
  const Custom = () => <div />;
  expect(isReactDOMElement(<div />)).toBeTrue();
  expect(isReactDOMElement(<Custom />)).toBeFalse();
});

test('uniqueClass', () => {
  expect(uniqueClass('1', '2')).toBe('2-1');
});

test('isRemirrorExtension', () => {
  const Custom: RemirrorFC = () => <div />;
  Custom.$$remirrorType = RemirrorElementType.Extension;
  expect(isRemirrorExtension(<Custom />)).toBeTrue();
});

test('isRemirrorProvider', () => {
  const Custom: RemirrorFC = () => <div />;
  Custom.$$remirrorType = RemirrorElementType.EditorProvider;
  expect(isRemirrorProvider(<Custom />)).toBeTrue();
});

test('isManagedRemirrorProvider', () => {
  const Custom: RemirrorFC = () => <div />;
  Custom.$$remirrorType = RemirrorElementType.ManagedEditorProvider;
  expect(isManagedRemirrorProvider(<Custom />)).toBeTrue();
});
