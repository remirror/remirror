// import { RemirrorExtension, RemirrorExtensionProps } from '@remirror/react';
import { RemirrorExtension, RemirrorExtensionProps } from '../../../@remirror/react/lib/index';
// import { MarkExtension, MarkExtensionOptions, MarkExtensionSpec } from '@remirror/core';
import { MarkExtension, MarkExtensionOptions, MarkExtensionSpec } from '../../../@remirror/core/lib/index';

interface ExtraOptions extends MarkExtensionOptions {
  one: string;
  two: number;
  three: { complex: unknown };
}

class TheMarkExtension extends MarkExtension<MarkExtensionOptions> {
  get name() {
    return 'theMark' as const;
  }

  get schema(): MarkExtensionSpec {
    return { attrs: {} };
  }
}

const A = () => (
  <>
    <RemirrorExtension Constructor={TheMarkExtension} />
  </>
);
