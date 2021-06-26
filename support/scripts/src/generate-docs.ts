import { readFile, writeFile } from 'fs-extra';
import inquirer from 'inquirer';
import Mustache from 'mustache';
import path from 'path';
import { entries, kebabCase } from '@remirror/core-helpers';

import { baseDir, fileExists, log } from './helpers';

type Template = 'extension' | 'package' | 'command' | 'stringHandler' | 'helper';
interface TemplateDetails {
  /**
   * The original location of the template.
   */
  origin: string;

  /**
   * The folder where the template should be output.
   */
  destinationFolder: string;
}

// The folder where the markdown templates are stored.
const templateFolder = baseDir('./support/templates/docs');

// A mapping of the types of generated docs to the location of their templates.
const templates: Record<Template, TemplateDetails> = {
  extension: {
    destinationFolder: baseDir('docs', 'extensions'),
    origin: path.join(templateFolder, 'extension.md'),
  },
  package: {
    destinationFolder: baseDir('docs', 'packages'),
    origin: path.join(templateFolder, 'package.md'),
  },
  command: {
    destinationFolder: baseDir('docs', 'commands'),
    origin: path.join(templateFolder, 'command.md'),
  },
  helper: {
    destinationFolder: baseDir('docs', 'helpers'),
    origin: path.join(templateFolder, 'helper.md'),
  },
  stringHandler: {
    destinationFolder: baseDir('docs', 'string-handlers'),
    origin: path.join(templateFolder, 'string-handler.md'),
  },
};

async function run() {
  const answers: { template: Template; entityName: string } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'What template would you like to use?',
      choices: entries(templates).map(([name]) => ({ name, type: 'choice', key: name[0] })),
    },
    { type: 'input', name: 'entityName', message: 'What name would you like to use?' },
  ]);

  const { origin, destinationFolder } = templates[answers.template];
  const template = await readFile(origin, { encoding: 'utf-8' });
  const rendered = Mustache.render(template, { name: answers.entityName });
  const destination = path.join(destinationFolder, `${kebabCase(answers.entityName)}.md`);

  if (await fileExists(destination)) {
    log.warn(`Documentation already exists at ${path.relative(baseDir(), destination)}`);
    return;
  }

  await writeFile(destination, rendered, {});
}

// Create an inquirer prompt which generates the documentation.

run().catch((error) => {
  log.fatal(error);
});
