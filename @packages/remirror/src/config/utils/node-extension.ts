import { INodeExtension } from '../../types';
import { Extension } from './extension';

export class NodeExtension<T extends {} = {}> extends Extension<T> implements INodeExtension {
  get type() {
    return 'node' as 'node';
  }

  get view() {
    return undefined;
  }

  get schema() {
    return {};
  }
}
