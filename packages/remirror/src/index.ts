import { getVersion } from 'json.macro';
import { SemanticVersion } from 'json.macro/types';

export const VERSION: SemanticVersion = getVersion(true);
