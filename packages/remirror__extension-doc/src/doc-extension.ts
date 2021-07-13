import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  EditorSchema,
  extension,
  ExtensionPriority,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  object,
  ProsemirrorAttributes,
  Static,
} from '@remirror/core';
import { AttributeSpec, Node } from '@remirror/pm/model';
import { Step, StepResult } from '@remirror/pm/transform';

export interface DocOptions {
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
  content?: Static<string>;

  /**
   * The doc node doesn't support `extraAttribute`. If you need to add support
   * for adding new attributes then set the array of attributes which should be
   * applied.
   *
   * The attributes are directly applied to the dom node.
   */
  docAttributes?: Static<string[]>;
}

/**
 * This is the default parent node. It is required in the Prosemirror Schema and
 * a representation of the `doc` is required as the top level node in all
 * editors.
 *
 * Extra attributes are disallowed for the doc extension.
 *
 * @required
 * @core
 */
@extension<DocOptions>({
  defaultOptions: {
    content: 'block+',
    docAttributes: [],
  },
  defaultPriority: ExtensionPriority.Medium,
  staticKeys: ['content', 'docAttributes'],
  disableExtraAttributes: true,
})
export class DocExtension extends NodeExtension<DocOptions> {
  get name() {
    return 'doc' as const;
  }

  /**
   * Create the node spec for the `doc` the content that you've provided.
   */
  createNodeSpec(_: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    const attrs: Record<string, AttributeSpec> = object();

    for (const key of this.options.docAttributes) {
      attrs[key] = { default: null };
    }

    return {
      attrs,
      content: this.options.content,
      ...override,
    };
  }

  /**
   * Update the attributes for the doc node.
   */
  @command()
  setDocAttributes(attrs: ProsemirrorAttributes): CommandFunction {
    return ({ tr, dispatch }) => {
      if (dispatch) {
        for (const [key, value] of Object.entries(attrs)) {
          tr.step(new SetDocAttributeStep(key, value));
        }

        dispatch(tr);
      }

      return true;
    };
  }
}

interface SetDocAttrStepJSONValue {
  key: string;
  stepType: string;
  value: any;
}

const STEP_TYPE = 'SetDocAttribute';
const REVERT_STEP_TYPE = 'RevertSetDocAttribute';

/**
 * A transaction step for updating the top level `doc` node attributes.
 *
 * This is required as mentioned in this discussion
 * https://discuss.prosemirror.net/t/changing-doc-attrs/784/17
 */
export class SetDocAttributeStep<Schema extends EditorSchema = EditorSchema> extends Step<Schema> {
  static fromJSON<Schema extends EditorSchema = EditorSchema>(
    _: Schema,
    json: SetDocAttrStepJSONValue,
  ): SetDocAttributeStep<Schema> {
    return new SetDocAttributeStep<Schema>(json.key, json.value, json.stepType);
  }

  /**
   * The attribute key.
   */
  readonly key: string;

  /**
   * A custom name for the step type.
   *
   * @default 'SetDocAttribute'
   */
  readonly stepType: string;

  /**
   * The value to be added.
   */
  readonly value: any;

  /**
   * The previous value.
   */
  previous?: any;

  constructor(key: string, value: unknown, stepType = STEP_TYPE) {
    super();
    this.stepType = stepType;
    this.key = key;
    this.value = value;
  }

  apply(doc: Node): StepResult<Schema> {
    this.previous = doc.attrs[this.key];

    const attrs = {
      ...doc.attrs,
      [this.key]: this.value,
    };

    return StepResult.ok(doc.type.create(attrs, doc.content, doc.marks));
  }

  invert(): SetDocAttributeStep<Schema> {
    return new SetDocAttributeStep(this.key, this.previous, REVERT_STEP_TYPE);
  }

  /**
   * The position never changes so `map` should return the current step.
   */
  map(): this {
    return this;
  }

  toJSON(): SetDocAttrStepJSONValue {
    return {
      stepType: this.stepType,
      key: this.key,
      value: this.value,
    };
  }
}

try {
  // Register the steps.
  Step.jsonID(STEP_TYPE, SetDocAttributeStep);
  Step.jsonID(REVERT_STEP_TYPE, SetDocAttributeStep);
} catch (error) {
  if (!error.message.startsWith(`Duplicate use of step JSON ID`)) {
    throw error;
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      doc: DocExtension;
    }
  }
}
