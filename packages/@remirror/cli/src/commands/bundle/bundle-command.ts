import { notifyUpdate } from '../../utils';
import { BaseCommand, CommandString, GetShapeOfCommandData } from '../base';
import { renderBundleEditor } from './bundle-ui';
import { bundleEntryPoint } from './bundle-utils';

/**
 * Create a new monorepo project.
 */
export class BundleCommand extends BaseCommand {
  public static usage = BaseCommand.Usage({
    description: 'Bundle a remirror editor for use within a webview.',
    category: 'Bundle',
    details: `
      Bundle your editor.
    `,
    examples: [
      [
        'Quickly create a new monorepo project called awesome with all the default options',
        '$0 bundle src/index.ts',
      ],
      [
        'Bundle an editor from an npm package. Make sure the editor supports being used within a webview. Not all of them do.',
        '$0 create @remirror/editor-social',
      ],
    ],
  });

  /**
   * The source of the editor to create. This can be a.
   */
  @BaseCommand.String({ required: true })
  public source: CommandString = '';

  @BaseCommand.Path('bundle')
  public async execute() {
    await renderBundleEditor({ ...this, method: bundleEntryPoint });
    notifyUpdate(this.context);
  }
}

declare global {
  namespace RemirrorCli {
    interface Commands {
      bundle: GetShapeOfCommandData<BundleCommand>;
    }
  }
}
