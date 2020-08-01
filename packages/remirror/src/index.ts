import { getVersion } from 'json.macro';
import type { SemanticVersion } from 'json.macro/types';

export const VERSION: SemanticVersion = getVersion(true);
