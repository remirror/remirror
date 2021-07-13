import { extensionValidityTest } from 'jest-remirror';
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
  TaskListExtension,
  TaskListItemExtension,
} from 'remirror/extensions';

extensionValidityTest(BulletListExtension);
extensionValidityTest(ListItemExtension);
extensionValidityTest(OrderedListExtension);
extensionValidityTest(TaskListExtension);
extensionValidityTest(TaskListItemExtension);
