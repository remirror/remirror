import { IMarkExtension } from '../../types';
import { Extension } from './extension';

export class MarkExtension extends Extension implements IMarkExtension {
  get type() {
    return 'mark' as 'mark';
  }

  get view() {
    return null;
  }

  get schema() {
    return {};
  }
}
