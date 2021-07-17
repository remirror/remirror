/**
 * Models for the versions of playground data.
 */

import { Model, ModelV0, ModelV1 } from './playground-types';

function migrateV0ToV1(_: ModelV0): ModelV1 {
  return {} as any;
}

/**
 * Migrate the model to the latest version.
 */
export function migrate(model: Model): ModelV1 {
  switch (model.version) {
    case 0:
      return migrateV0ToV1(model);

    default:
      return model;
  }
}
