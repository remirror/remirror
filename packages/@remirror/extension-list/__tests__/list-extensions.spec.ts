import { extensionValidityTest } from 'jest-remirror';
import { BulletListExtension, ListItemExtension, OrderedListExtension } from 'remirror/extensions';

extensionValidityTest(BulletListExtension);
extensionValidityTest(ListItemExtension);
extensionValidityTest(OrderedListExtension);
