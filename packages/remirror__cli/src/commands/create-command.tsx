/* eslint-disable no-console */
import assert from 'assert';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import cpy from 'cpy';
import execa from 'execa';
import { promises as fs } from 'fs';
import globby from 'globby';
import path from 'path';
import { camelCase, invariant, pascalCase } from '@remirror/core-helpers';

import { notifyUpdate } from '../cli-utils';
import { BaseCommand, CommandString, GetShapeOfCommandData } from './base-command';

/**
 * Create a new `@remirror` package.
 */
export class CreateCommand extends BaseCommand {
  static paths = [['create']];
  static usage = Command.Usage({
    description: 'Create a package from a template directory.',
    category: 'Create',
    details: `
      Quickly bootstrap a package for the remirror monorepo.

      This command is currently internal only, but will be expanded to support external usage.
    `,
    examples: [
      ['Quickly create a new minimal package', '$0 create awesome'],
      [
        'Specify a that you would like to use the minimal template',
        '$0 create awesome --template minimal',
      ],
    ],
  });

  /**
   * The full name of the package,
   *
   * e.g '@remirror/extension-amazing'
   */
  name: CommandString = Option.String();

  /**
   * The package description which is used in the generated `package.json` file
   * and `README.md`.
   */
  description: CommandString = Option.String('--description,-d', {
    description: 'Provide the description for the package.',
    required: true,
  });

  async execute(): Promise<void> {
    invariant(this.name.startsWith('@remirror/'), {
      message: 'Only scoped packages are supported at this time.',
    });

    const template: keyof typeof templateTransformations = this.name.startsWith('@remirror/preset-')
      ? ('preset-template' as const)
      : this.name.startsWith('@remirror/extension-')
      ? ('extension-template' as const)
      : ('minimal-template' as const);

    createPackage(template, this);
    notifyUpdate(this.context);
  }
}

type SupportedTemplates = 'preset-template' | 'extension-template' | 'minimal-template';

type TemplateTransformations = Record<
  SupportedTemplates,
  {
    /**
     * Replace the provided contents with required values.
     */
    replace: (
      content: string,
      values: { name: string; description: string; unscopedName: string },
    ) => string;
    /**
     * Return undefined or false to skip renaming the file.
     */
    renameFile: (values: {
      dirname: string;
      basename: string;
      unscopedName: string;
    }) => string | undefined | false;
  }
>;

const SEPARATOR = '__';

/**
 * Convert a mangled name to its unmangled version.
 *
 * `babel__types` => `@babel/types`.
 */
export function unmangleScopedPackage(mangledName: string): string {
  return mangledName.includes(SEPARATOR) ? `@${mangledName.replace(SEPARATOR, '/')}` : mangledName;
}

/**
 * Mangle a scoped package name. Which removes the `@` symbol and adds a `__`
 * separator.
 *
 * `@babel/types` => `babel__types`
 */
export function mangleScopedPackageName(packageName: string): string {
  const [scope, name] = packageName.split('/');
  assert.ok(scope, `Invalid package name provided: ${packageName}`);

  if (name) {
    return [scope.replace('@', ''), name].join(SEPARATOR);
  }

  return scope;
}

const templateTransformations: TemplateTransformations = {
  'minimal-template': {
    replace: (contents, { name, description, unscopedName }) =>
      contents
        .replace(/@remirror\/minimal-template/g, name)
        .replace(/support\/templates/g, mangleScopedPackageName(name))
        .replace(/TEMPLATE_DESCRIPTION/g, description)
        .replace(/minimal-template/g, unscopedName)
        .replace(/template-minimal/g, unscopedName),
    renameFile: () => false,
  },
  'extension-template': {
    replace: (contents, { description, name, unscopedName }) => {
      const extensionName = unscopedName.replace('extension-', '');
      const camelExtensionName = camelCase(extensionName);
      const pascalExtensionName = `${pascalCase(extensionName)}Extension`;
      const pascalExtensionOptions = `${pascalCase(extensionName)}Options`;

      return contents
        .replace(/@remirror\/extension-template/g, name)
        .replace(/support\/templates/g, mangleScopedPackageName(name))
        .replace(/TemplateOptions/g, pascalExtensionOptions)
        .replace(/TemplateExtension/g, pascalExtensionName)
        .replace(/TEMPLATE_DESCRIPTION/g, description)
        .replace(/template-extension/g, `${extensionName}-extension`)
        .replace(/extension-template/g, unscopedName)
        .replace(/'template'/g, `'${camelExtensionName}'`);
    },
    renameFile: ({ basename, unscopedName }) => {
      if (!basename.includes('template-extension')) {
        return;
      }

      const extensionName = unscopedName.replace('extension-', '');
      return basename.replace('template-extension', `${extensionName}-extension`);
    },
  },
  'preset-template': {
    replace: (contents, { description, name, unscopedName }) => {
      const presetName = unscopedName.replace('preset-', '');
      const camelPresetName = `${camelCase(presetName)}Preset`;
      const pascalPresetOptions = `${pascalCase(presetName)}Options`;

      return contents
        .replace(/@remirror\/preset-template/g, name)
        .replace(/support\/templates/g, mangleScopedPackageName(name))
        .replace(/TemplateOptions/g, pascalPresetOptions)
        .replace(/templatePreset/g, camelPresetName)
        .replace(/TEMPLATE_DESCRIPTION/g, description)
        .replace(/template-preset/g, `${presetName}-preset`)
        .replace(/preset-template/g, unscopedName);
    },
    renameFile: ({ basename, unscopedName }) => {
      if (!basename.includes('template-preset')) {
        return;
      }

      const presetName = unscopedName.replace('preset-', '');
      return basename.replace('template-preset', `${presetName}-preset`);
    },
  },
};

/**
 * Safely get the stats for a file.
 */
async function getFileStatSync(target: string) {
  try {
    const stat = await fs.lstat(target);
    return stat;
  } catch {
    return;
  }
}

/**
 * Create the package.
 */
async function createPackage(
  template: keyof typeof templateTransformations,
  { name, description, cwd }: RemirrorCli.Commands['create'],
) {
  const templateDirectory = path.join(cwd, 'support/templates', template);
  const outputDirectory = path.join(cwd, 'packages', mangleScopedPackageName(name));
  const stat = await getFileStatSync(outputDirectory);

  if (stat?.isDirectory()) {
    console.log(chalk`\n{magenta Package already exists.}\n✌️  Bailing ✌️`);
    return;
  }

  // Copy the files into the output location.
  await cpy(['**'], outputDirectory, {
    overwrite: false,
    ignore: ['node_modules/**', 'dist'],
    parents: true,
    cwd: templateDirectory,
  });

  const files = await globby('**', { cwd: outputDirectory, absolute: true, onlyFiles: true });
  const transform = templateTransformations[template];

  for (const file of files) {
    const dirname = path.dirname(file);
    const basename = path.basename(file);
    const unscopedName = name.replace('@remirror/', '');
    const content = await fs.readFile(file, 'utf-8');
    const changedContent = transform.replace(content, { name, description, unscopedName });
    console.log(changedContent);

    // Update the file contents.
    if (changedContent !== content) {
      await fs.writeFile(file, changedContent);
    }

    const updatedBasename = transform.renameFile({ basename, dirname, unscopedName });

    // Rename the file.
    if (updatedBasename) {
      await fs.rename(file, path.join(dirname, updatedBasename));
    }
  }

  // Fix the build.
  console.log(chalk`\n{yellow Updating browser field...}`);
  await execa('pnpm', ['fix:build'], { stdout: 'inherit' });

  // Fix the versions
  console.log(chalk`\n{yellow Updating versions...}`);
  await execa('pnpm', ['fix:repo'], { stdout: 'inherit' });

  // Update the installation.
  console.log(chalk`\n{yellow Installing packages...}`);
  await execa('pnpm', ['install'], { stdout: 'inherit' });

  console.log(chalk`\n{green Successfully created a new package:} {blue.bold ${name} }`);
}

declare global {
  namespace RemirrorCli {
    interface Commands {
      create: GetShapeOfCommandData<CreateCommand>;
    }
  }
}
