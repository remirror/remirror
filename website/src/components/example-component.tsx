import { BaseProps } from 'docusaurus-plugin-examples/types';

import { ExampleIFrame } from './example-iframe-component';
import { ExampleSource } from './example-source-component';
import { ToggleLanguage } from './toggle-language-component';

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
}

export const Example = (props: ExampleProps) => {
  const { name, hideSource } = props;

  return (
    <div>
      <ToggleLanguage />
      <ExampleIFrame name={name} />
      {!hideSource && <ExampleSource name={name} />}
    </div>
  );
};
