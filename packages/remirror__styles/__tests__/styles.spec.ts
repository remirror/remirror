import * as dom from '../dom';
import * as emotion from '../emotion';
import * as styled from '../styled-components';

test('imports are valid', () => {
  expect(Object.keys(dom).every((name) => !name.endsWith('StyledComponent'))).toBeTrue();
  expect(Object.keys(dom).some((name) => name.endsWith('StyledCss'))).toBeTrue();

  expect(Object.keys(emotion).some((name) => name.endsWith('StyledCss'))).toBeTrue();
  expect(Object.keys(emotion).some((name) => name.endsWith('StyledComponent'))).toBeTrue();

  expect(Object.keys(styled).some((name) => name.endsWith('StyledCss'))).toBeTrue();
  expect(Object.keys(styled).some((name) => name.endsWith('StyledComponent'))).toBeTrue();
});

test('utils can add styles to elements', () => {
  const element = document.createElement('div');
  dom.addStylesToElement(element, dom.coreStyledCss);

  expect(element).toHaveClass(dom.coreStyledCss);
});
