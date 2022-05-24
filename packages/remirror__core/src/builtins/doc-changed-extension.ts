import { ExtensionPriority } from '@remirror/core-constants';
import type { Handler } from '@remirror/core-types';

import { extension, PlainExtension } from '../extension';
import type { StateUpdateLifecycleProps } from '../types';

export interface DocChangedOptions {
  docChanged?: Handler<(props: StateUpdateLifecycleProps) => void>;
}

@extension<DocChangedOptions>({
  handlerKeys: ['docChanged'],
  handlerKeyOptions: {
    docChanged: { earlyReturnValue: false }, // Execute all handlers, even if one returns false
  },
  defaultPriority: ExtensionPriority.Lowest,
})
export class DocChangedExtension extends PlainExtension<DocChangedOptions> {
  get name() {
    return 'docChanged' as const;
  }

  onStateUpdate(props: StateUpdateLifecycleProps): void {
    const { firstUpdate, transactions, tr } = props;

    if (firstUpdate) {
      return;
    }

    if ((transactions ?? [tr]).some((tr) => tr?.docChanged)) {
      this.options.docChanged(props);
    }
  }
}
