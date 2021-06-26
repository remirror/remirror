import * as doc from '@microsoft/tsdoc';
import path from 'path';
import readPackageUp from 'read-pkg-up';
import * as tsm from 'ts-morph';
import { Logger } from 'tslog';
import { invariant } from '@remirror/core-helpers';

import { DocGenExports } from './docgen-types';

/**
 * The logger used when running scripts.
 */
export const log: Logger = new Logger({ minLevel: 'debug' });

/**
 * Get the package name from an exported declaration.
 */
export function getPackageName(declaration: tsm.ExportedDeclarations): string {
  const cwd = declaration.getSourceFile().getFilePath();
  let data = readPackageUp.sync({ cwd });

  while (data && !data.packageJson.name) {
    data = readPackageUp.sync({ cwd: data.path });
  }

  const name = data?.packageJson.name;
  invariant(name, {});

  return name;
}

interface GenerateIdentifier {
  declaration: tsm.ExportedDeclarations | tsm.LocalTargetDeclarations;
  name: string;
}

/**
 * Generate a unique id from the provided declaration.
 *
 * `{Location}.{Name}.{Kind}
 */
export function generateIdentifier({ declaration, name }: GenerateIdentifier): string {
  const location = path.relative(process.cwd(), declaration.getSourceFile().getFilePath());
  const kind = declaration.getKindName();

  return `${location}.${name}.${kind}`;
}

interface GenerateDocGenExports {
  project: tsm.Project;
  entryPoint: string;
}

/**
 * From the provided project and source file generate an exports object list.
 */
export function generateDocGenExports({
  project,
  entryPoint,
}: GenerateDocGenExports): DocGenExports[] {
  const sourceFile = project.getSourceFile(entryPoint);
  const generated: DocGenExports[] = [];

  if (!sourceFile) {
    return generated;
  }

  const allExports = sourceFile.getExportedDeclarations();

  for (const [name, declarations] of allExports.entries()) {
    const merged = isMergeDeclarations(declarations);

    for (const declaration of declarations) {
      const leadingComment = declaration.getLeadingCommentRanges()[0]?.getText() ?? '';
      const id = generateIdentifier({ declaration, name });
      const kind = declaration.getKindName();
      const pkg = getPackageName(declaration);

      generated.push({ leadingComment, merged, name, id, kind, package: pkg });
    }
  }

  return generated;
}

/**
 * Create the project where all the entry points can be searched.
 */
export function createProject(): tsm.Project {
  const tsConfigFilePath = baseDir('./packages/remirror/src/tsconfig.json');
  const reactTsConfigFilePath = baseDir('./packages/remirror__react/src/tsconfig.json');
  const project = new tsm.Project({ tsConfigFilePath });
  project.addSourceFilesFromTsConfig(reactTsConfigFilePath);

  return project;
}

/**
 * Create the tsdoc parser which will be used for comments.
 */
export function createTSDocParser(): doc.TSDocParser {
  const standardization = 'None' as doc.Standardization;
  const configuration = new doc.TSDocConfiguration();
  configuration.addTagDefinitions([
    {
      allowMultiple: true,
      standardization,
      syntaxKind: doc.TSDocTagSyntaxKind.BlockTag,
      tagName: '@tag',
      tagNameWithUpperCase: '@TAG',
    },
    {
      allowMultiple: false,
      standardization,
      syntaxKind: doc.TSDocTagSyntaxKind.BlockTag,
      tagName: '@category',
      tagNameWithUpperCase: '@CATEGORY',
    },
    {
      allowMultiple: false,
      standardization,
      syntaxKind: doc.TSDocTagSyntaxKind.BlockTag,
      tagName: '@default',
      tagNameWithUpperCase: '@DEFAULT',
    },
    {
      allowMultiple: true,
      standardization,
      syntaxKind: doc.TSDocTagSyntaxKind.BlockTag,
      tagName: '@template',
      tagNameWithUpperCase: '@TEMPLATE',
    },
  ]);

  return new doc.TSDocParser(configuration);
}

/**
 * Get a path relative to the base directory of this project. If called with no
 * arguments it will return the base directory.
 */
export function baseDir(...paths: string[]): string {
  return path.resolve(__dirname, '../../..', path.join(...paths));
}

function isMergeDeclarations(declarations: tsm.ExportedDeclarations[]) {
  return (
    declarations.length > 1 &&
    declarations.some((declaration) => tsm.ClassDeclaration.is(declaration.getKind()))
  );
}
