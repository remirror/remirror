import { axe } from 'jest-axe';
import { render } from 'react-testing-library';

const renderString = (
  node: JSX.Element,
  options?: { container: HTMLElement; baseElement?: HTMLElement },
): string => {
  const { container } = render(node, options);
  return container.innerHTML;
};

export * from 'react-testing-library';

export { axe, renderString };
