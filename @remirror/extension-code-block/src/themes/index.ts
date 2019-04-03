import { default as a11yDark } from './a11y-dark';
import { default as atomDark } from './atom-dark';
import { default as base16AteliersulphurpoolLight } from './base16-ateliersulphurpool.light';
import { default as cb } from './cb';
import { default as darcula } from './darcula';
import { default as dracula } from './dracula';
import { default as duotoneDark } from './duotone-dark';
import { default as duotoneEarth } from './duotone-earth';
import { default as duotoneForest } from './duotone-forest';
import { default as duotoneLight } from './duotone-light';
import { default as duotoneSea } from './duotone-sea';
import { default as duotoneSpace } from './duotone-space';
import { default as ghcolors } from './ghcolors';
import { default as hopscotch } from './hopscotch';
import { default as pojoaque } from './pojoaque';
import { default as vs } from './vs';
import { default as xonokai } from './xonokai';

export const syntaxTheme = {
  a11yDark,
  atomDark,
  base16AteliersulphurpoolLight,
  cb,
  darcula,
  dracula,
  duotoneDark,
  duotoneEarth,
  duotoneForest,
  duotoneLight,
  duotoneSea,
  duotoneSpace,
  ghcolors,
  hopscotch,
  pojoaque,
  vs,
  xonokai,
};

export type SyntaxTheme = keyof typeof syntaxTheme;
