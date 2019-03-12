import { Extension } from '@remirror/core';

export interface MenuPositionOptions {
  holder?: string;
}

export class MenuPosition extends Extension<MenuPositionOptions> {
  get name(): 'menu' {
    return 'menu';
  }
}
