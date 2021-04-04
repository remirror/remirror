import { extensionValidityTest } from 'jest-remirror';

import {
  TableCellExtension,
  TableControllerCellExtension,
  TableExtension,
  TableHeaderCellExtension,
  TableRowExtension,
} from '../';

extensionValidityTest(TableExtension);
extensionValidityTest(TableCellExtension);
extensionValidityTest(TableControllerCellExtension);
extensionValidityTest(TableHeaderCellExtension);
extensionValidityTest(TableRowExtension);
