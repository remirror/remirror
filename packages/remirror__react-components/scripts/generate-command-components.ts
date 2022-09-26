import { promises as fs } from 'fs';
import globby from 'globby';
import path from 'path';
import { pascalCase } from '@remirror/core';

async function getCommandFiles(glob: string): Promise<string[]> {
  const files = await globby(glob, { absolute: true, onlyFiles: true });
  files.sort((a, z) => path.basename(a).localeCompare(path.basename(z)));
  return files;
}

function generateButtonComponent(componentName: string): string {
  return `export type ${componentName}ButtonProps = Omit<${componentName}Props<typeof CommandButton>, 'as'>;

export const ${componentName}Button: FC<${componentName}ButtonProps> = (props) => {
  return <${componentName} as={CommandButton} {...props} />;
};
`;
}

function generateMenuItemComponent(componentName: string): string {
  return `export type ${componentName}MenuItemProps = Omit<${componentName}Props<typeof CommandMenuItem>, 'as'>;

export const ${componentName}MenuItem: FC<${componentName}MenuItemProps> = (props) => {
  return <${componentName} as={CommandMenuItem} {...props} />;
};
`;
}

async function run() {
  const files = await getCommandFiles(path.resolve(process.cwd(), './src/commands/*.tsx'));
  const imports: string[] = [];
  const buttonComponents: string[] = [];
  const menuItemComponents: string[] = [];

  for (const file of files) {
    const fileName = path.parse(file).name;
    const componentName = pascalCase(fileName);

    imports.push(
      `import { ${componentName}, ${componentName}Props } from '../commands/${fileName}';`,
    );
    buttonComponents.push(generateButtonComponent(componentName));
    menuItemComponents.push(generateMenuItemComponent(componentName));
  }

  const commandImports = imports.join('\n');
  const buttonFileContent = buttonComponents.join('\n');
  const menuItemsFileContent = menuItemComponents.join('\n');

  const buttonsPath = path.resolve(process.cwd(), './src/buttons/index.tsx');
  const menusPath = path.resolve(process.cwd(), './src/menus/index.tsx');

  await Promise.all([
    fs.writeFile(
      buttonsPath,
      [
        "import React, { FC } from 'react';",
        '',
        "import { CommandButton } from '../';",
        commandImports,
        '',
        buttonFileContent,
      ].join('\n'),
    ),
    fs.writeFile(
      menusPath,
      [
        "import React, { FC } from 'react';",
        '',
        "import { CommandMenuItem } from '../';",
        commandImports,
        '',
        menuItemsFileContent,
      ].join('\n'),
    ),
  ]);
}

run();
