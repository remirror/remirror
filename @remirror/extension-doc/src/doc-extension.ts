import { DefaultSettingsType, NodeExtension } from '@remirror/core';

export interface DocExtensionSettings {
  /**
   * Adjust the content allowed in this prosemirror document.
   *
   * This will alter the schema if changed after initialization and can cause
   * errors. It should only be set **once** per editor.
   *
   * @remarks
   *
   * This field controls what sequences of child nodes are valid for this node
   * type.
   *
   * Taken from https://prosemirror.net/docs/guide/#schema.content_expressions
   *
   * You can say, for example "paragraph" for “one paragraph”, or "paragraph+"
   * to express “one or more paragraphs”. Similarly, "paragraph*" means “zero or
   * more paragraphs” and "caption?" means “zero or one caption node”. You can
   * also use regular-expression-like ranges, such as {2} (“exactly two”) {1, 5}
   * (“one to five”) or {2,} (“two or more”) after node names.
   *
   * Such expressions can be combined to create a sequence, for example "heading
   * paragraph+" means ‘first a heading, then one or more paragraphs’. You can
   * also use the pipe | operator to indicate a choice between two expressions,
   * as in "(paragraph | blockquote)+".
   *
   * Some groups of element types will appear multiple types in your schema—for
   * example you might have a concept of “block” nodes, that may appear at the
   * top level but also nested inside of blockquotes. You can create a node
   * group by giving your node specs a group property, and then refer to that
   * group by its name in your expressions.
   *
   * @core
   */
  content?: string;
}

/**
 * This is the default parent node. It is required in the Prosemirror Schema and
 * a representation of the `doc` is required as the top level node in all
 * editors.
 *
 * @required
 * @core
 */
export class DocExtension extends NodeExtension<DocExtensionSettings> {
  public static defaultSettings: DefaultSettingsType<DocExtensionSettings> = {
    content: 'block+',
  };

  public static defaultProperties = {};

  public readonly name = 'doc' as const;

  protected createDefaultSettings() {
    return DocExtension.defaultSettings;
  }

  protected createDefaultProperties() {
    return DocExtension.defaultProperties;
  }

  protected createNodeSpec() {
    return {
      content: this.settings.content,
    };
  }
}
