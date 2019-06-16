/**
 * @jest-environment node
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  cloneElement,
  getElementProps,
  isManagedRemirrorProvider,
  isReactDOMElement,
  isRemirrorExtension,
  isRemirrorProvider,
  uniqueClass,
  updateChildWithKey,
} from '../helpers';
import { RemirrorElementType, RemirrorFC } from '../types';

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

describe('cloneElement', () => {
  it('clones flat components', () => {
    const el = (
      <div className='simple'>
        <p>simple</p>
        <p>element</p>
      </div>
    );
    const cloned = cloneElement(el, el.props);
    const elString = renderToStaticMarkup(el);
    const clonedString = renderToStaticMarkup(cloned);
    expect(elString).toEqual(clonedString);
  });

  it('clones nested components', () => {
    const el = (
      <div className='nested'>
        <p>
          simple
          <strong>
            element<em>nesting</em>
          </strong>
        </p>
      </div>
    );
    const cloned = cloneElement(el, el.props);
    const elString = renderToStaticMarkup(el);
    const clonedString = renderToStaticMarkup(cloned);
    expect(elString).toEqual(clonedString);
  });

  it('can add children', () => {
    const child = <p>Another one</p>;
    const propChild = <p>simple</p>;
    const el = <div className='children'>{propChild}</div>;
    const cloned = cloneElement(el, el.props, child);
    const childString = renderToStaticMarkup(child);
    const propChildString = renderToStaticMarkup(propChild);
    const clonedString = renderToStaticMarkup(cloned);
    expect(clonedString).toInclude(propChildString);
    expect(clonedString).toInclude(childString);
  });

  it('can add children as arrays', () => {
    const children = [<p key={1}>Another one</p>, <p key={2}>and two</p>, <p key={3}>third</p>];
    const propChild = <p>simple</p>;
    const el = <div className='children'>{propChild}</div>;
    const cloned = cloneElement(el, el.props, children);
    const childrenString = renderToStaticMarkup(<>{children}</>);
    const propChildString = renderToStaticMarkup(propChild);
    const clonedString = renderToStaticMarkup(cloned);
    expect(clonedString).toInclude(propChildString);
    expect(clonedString).toInclude(childrenString);
  });
});
