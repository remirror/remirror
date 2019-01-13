import { InputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import {
  CommandParams,
  IExtension,
  IMarkExtension,
  INodeExtension,
  MarkExtensionSpec,
  NodeExtensionSpec,
  ProsemirrorPlugin,
  SchemaParams,
} from '../../types';

const isNodeExtension = (ext: IExtension): ext is INodeExtension => ext.type === 'node';
const isMarkExtension = (ext: IExtension): ext is IMarkExtension => ext.type === 'mark';

const hasExtensionProperty = <T extends IExtension, U extends keyof T>(property: U) => (
  ext: T,
): ext is T & Pick<Required<T>, U> => Boolean(ext[property]);

type ExtensionMethodProperties = 'inputRules' | 'pasteRules' | 'keys';
const extensionPropertyMapper = <T extends IExtension, U extends ExtensionMethodProperties>(
  property: U,
  schema: Schema,
) => (extension: T) =>
  isNodeExtension(extension)
    ? extension[property]({ schema, type: schema.nodes[extension.name] })
    : isMarkExtension(extension)
    ? extension[property]({ schema, type: schema.marks[extension.name] })
    : extension[property]({ schema });

export class ExtensionManager {
  constructor(public extensions: IExtension[]) {
    this.extensions = extensions;
  }

  get nodes() {
    const initialEditorNodes: Record<string, NodeExtensionSpec> = {};
    return this.extensions.filter(isNodeExtension).reduce(
      (nodes, { name, schema }) => ({
        ...nodes,
        [name]: schema,
      }),
      initialEditorNodes,
    );
  }

  get marks() {
    const initialEditorMarks: Record<string, MarkExtensionSpec> = {};
    return this.extensions.filter(isMarkExtension).reduce(
      (marks, { name, schema }) => ({
        ...marks,
        [name]: schema,
      }),
      initialEditorMarks,
    );
  }

  get plugins() {
    const initialPlugins: ProsemirrorPlugin[] = [];
    return this.extensions
      .filter(extension => extension.plugins)
      .reduce((allPlugins, { plugins }) => [...allPlugins, ...(plugins || [])], initialPlugins);
  }

  public keymaps({ schema }: SchemaParams): ProsemirrorPlugin[] {
    const extensionKeymaps = this.extensions
      .filter(hasExtensionProperty('keys'))
      .map(extensionPropertyMapper('keys', schema));
    return extensionKeymaps.map(keys => keymap(keys));
  }

  public inputRules({ schema }: SchemaParams) {
    const extensionInputRules = this.extensions
      .filter(hasExtensionProperty('inputRules'))
      .map(extensionPropertyMapper('inputRules', schema)) as InputRule[][];

    return extensionInputRules.reduce(
      (allInputRules, inputRules) => [...allInputRules, ...inputRules],
      [],
    );
  }

  public pasteRules({ schema }: SchemaParams): ProsemirrorPlugin[] {
    const extensionPasteRules = this.extensions
      .filter(hasExtensionProperty('pasteRules'))
      .map(extensionPropertyMapper('pasteRules', schema)) as ProsemirrorPlugin[][];

    return extensionPasteRules.reduce(
      (allPasteRules, pasteRules) => [...allPasteRules, ...pasteRules],
      [],
    );
  }

  /**
   * Generate all the commands for usage within the UI.
   * For example a menu can use a command to toggle bold.
   */
  public commands({ schema, view, editable }: CommandParams) {
    const initialCommands: Record<string, () => void> = {};
    return this.extensions
      .filter(hasExtensionProperty('commands'))
      .reduce((allCommands, extension) => {
        const { name } = extension;
        const commands: Record<string, () => void> = {};
        const value = extension.commands({
          schema,
          ...(isMarkExtension(extension)
            ? { type: schema.marks[extension.name] }
            : isNodeExtension(extension)
            ? { type: schema.nodes[extension.name] }
            : {}),
        });

        if (Array.isArray(value)) {
          commands[name] = () =>
            value.forEach(callback => {
              if (!editable) {
                return false;
              }
              view.focus();
              return callback()(view.state, view.dispatch);
            });
        } else if (typeof value === 'function') {
          commands[name] = () => {
            if (!editable) {
              return false;
            }
            view.focus();
            return value()(view.state, view.dispatch);
          };
        } else if (typeof value === 'object') {
          Object.entries(value).forEach(([commandName, commandValue]) => {
            if (Array.isArray(commandValue)) {
              commands[commandName] = () =>
                commandValue.forEach(callback => {
                  if (!editable) {
                    return false;
                  }
                  view.focus();
                  return callback()(view.state, view.dispatch);
                });
            } else {
              commands[commandName] = () => {
                if (!editable) {
                  return false;
                }
                view.focus();
                return commandValue()(view.state, view.dispatch);
              };
            }
          });
        }

        return {
          ...allCommands,
          ...commands,
        };
      }, initialCommands);
  }
}
