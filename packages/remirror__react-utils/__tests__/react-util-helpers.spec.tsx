import { getElementProps, isReactDOMElement, isReactFragment } from '../';

test('getElementProps', () => {
  const expected = { id: 'test' };
  const Element = <div {...expected} />;

  expect(getElementProps(Element)).toEqual(expected);
});

test('isReactDOMElement', () => {
  const Custom = () => <div />;

  expect(isReactDOMElement(<div />)).toBeTrue();
  expect(isReactDOMElement(<Custom />)).toBeFalse();
});

test('isReactFragment', () => {
  const Custom = () => <div />;

  expect(isReactFragment(<></>)).toBeTrue();
  expect(
    isReactFragment(
      <>
        <Custom />
      </>,
    ),
  ).toBeTrue();
  expect(isReactFragment(<Custom />)).toBeFalse();
});
