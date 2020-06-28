import { OnSetOptionsParameter, Preset } from '@remirror/core';

import { BulletListExtension } from './bullet-list-extension';
import { ListItemExtension } from './list-item-extension';
import { OrderedListExtension } from './ordered-list-extension';

export class ListPreset extends Preset {
  get name() {
    return 'template' as const;
  }

  protected onSetOptions(_: OnSetOptionsParameter<object>) {}

  createExtensions() {
    return [new OrderedListExtension(), new BulletListExtension(), new ListItemExtension()];
  }
}
