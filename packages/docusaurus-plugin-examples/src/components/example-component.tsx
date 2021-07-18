/// <reference types="@docusaurus/theme-classic" />

import { ExampleIFrame } from './example-iframe-component';
import { ExampleSource } from './example-source-component';
import { BaseProps } from '../types';

export interface ExampleProps extends BaseProps {
  /**
   * Set to true to hide the source code.
   *
   * @default false
   */
  hideSource?: boolean;

  /**
   * Set to false to hide the code sandbox edit link.
   *
   * @default true
   */
  hideSandbox?: boolean;

  /**
   * Set to `false` to hide the code in the playground.
   *
   * @default false
   */
  hidePlayground?: boolean;
}

export const Example = (props: ExampleProps) => {
  const { name, hideSource, language } = props;

  return (
    <div>
      <ExampleIFrame name={name} />
      {!hideSource && <ExampleSource name={name} language={language} />}
    </div>
  );
};
