import prettyFormat from 'pretty-format';
import { html } from 'htm/react';
import { prettyDOM } from '@testing-library/dom';
const { ReactElement } = prettyFormat.plugins;

/**
 * Format a react element for printing to the dom
 */
const format = (element: JSX.Element) =>
  prettyFormat(element, {
    plugins: [ReactElement],
    printFunctionName: false,
    highlight: true,
  });

/**
 * Log a pretty html string
 *
 * @param html - the string to print
 */
export const logHtml = (str: string) => {
  console.log(
    html`
      <div>${str}</div>
    `,
  );
  console.log(
    format(
      html`
        ${str}
      `,
    ),
  );
};

/**
 * Log an element in a pretty way within the dom
 *
 * @param element - the element to print
 */
export const logElement = (element: Node) => console.log(prettyDOM(element as HTMLElement));

/**
 * Log JSX in a pretty way
 *
 * @param jsx - the jsx to print
 */
export const logJSX = (jsx: JSX.Element) => console.log(format(jsx));

declare global {
  const __DEV__: boolean;
  const __TEST__: boolean;
  /**
   * Identifies whether this is an e2e test
   */
  const __E2E__: boolean;
}
