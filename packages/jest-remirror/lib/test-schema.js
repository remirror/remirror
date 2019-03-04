"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.testSchema = exports.baseExtensions = void 0;

var _core = require("@remirror/core");

var _coreExtensions = require("@remirror/core-extensions");

/** All the required and core extensions for testing */
const baseExtensions = [new _core.Doc(), new _core.Text(), new _core.Paragraph(), new _coreExtensions.Bold(), new _coreExtensions.Italic(), new _coreExtensions.CodeBlock(), new _coreExtensions.Underline(), new _coreExtensions.Strike(), new _coreExtensions.Code(), new _coreExtensions.Heading(), new _coreExtensions.Image(), new _coreExtensions.Bullet(), new _coreExtensions.Blockquote(), new _coreExtensions.HardBreak(), new _coreExtensions.ListItem(), new _coreExtensions.OrderedList()];
exports.baseExtensions = baseExtensions;
const extensionManager = new _core.ExtensionManager(baseExtensions, () => (0, _core.Cast)({}), () => (0, _core.Cast)({}));
const testSchema = extensionManager.createSchema();
exports.testSchema = testSchema;
//# sourceMappingURL=test-schema.js.map