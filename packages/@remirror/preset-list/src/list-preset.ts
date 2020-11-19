import { OnSetOptionsParameter, Preset, presetDecorator } from '@remirror/core';

import { BulletListExtension } from './bullet-list-extension';
import { ListItemExtension } from './list-item-extension';
import { OrderedListExtension } from './ordered-list-extension';

@presetDecorator({})
export class ListPreset extends Preset {
  get name() {
    return 'list' as const;
  }

  protected onSetOptions(_: OnSetOptionsParameter<object>): void {}

  createExtensions() {
    return [new OrderedListExtension(), new BulletListExtension(), new ListItemExtension()];
  }
}
