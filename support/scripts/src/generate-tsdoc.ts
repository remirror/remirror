import {
  DocDeclarationReference,
  Standardization,
  TSDocConfiguration,
  TSDocParser,
  TSDocTagSyntaxKind,
} from '@microsoft/tsdoc';
import { DeclarationReference } from '@microsoft/tsdoc/lib-commonjs/beta/DeclarationReference';
import { readFile } from 'fs-extra';
// import { TSDocConfigFile } from '@microsoft/tsdoc-config';
import path from 'path';
import { ClassDeclaration, ExportedDeclarations, ModuleDeclaration, Project } from 'ts-morph';

import { baseDir, log } from './helpers';

const standardization = 'None' as Standardization;

const tsConfigFilePath = baseDir('./packages/remirror/src/tsconfig.json');
const reactTsConfigFilePath = baseDir('./packages/remirror__react/src/tsconfig.json');
const remirrorEntryPoint = baseDir('./packages/remirror/src/index.ts');
const configuration: TSDocConfiguration = new TSDocConfiguration();
configuration.addTagDefinitions([
  {
    allowMultiple: true,
    standardization,
    syntaxKind: TSDocTagSyntaxKind.BlockTag,
    tagName: '@tag',
    tagNameWithUpperCase: '@TAG',
  },
  {
    allowMultiple: false,
    standardization,
    syntaxKind: TSDocTagSyntaxKind.BlockTag,
    tagName: '@category',
    tagNameWithUpperCase: '@CATEGORY',
  },
  {
    allowMultiple: false,
    standardization,
    syntaxKind: TSDocTagSyntaxKind.BlockTag,
    tagName: '@default',
    tagNameWithUpperCase: '@DEFAULT',
  },
  {
    allowMultiple: true,
    standardization,
    syntaxKind: TSDocTagSyntaxKind.BlockTag,
    tagName: '@template',
    tagNameWithUpperCase: '@TEMPLATE',
  },
]);
const parser = new TSDocParser(configuration);

async function run() {
  const project = new Project({ tsConfigFilePath });
  log.info({ sourceFiles: project.getSourceFiles().length });
  project.addSourceFilesFromTsConfig(reactTsConfigFilePath);
  log.info({ sourceFiles: project.getSourceFiles().length });
  const sourceFiles = project.getSourceFiles();
  const sourceFile = project.getSourceFile(remirrorEntryPoint);
  const remirrorModules: ModuleDeclaration[] = [];

  for (const file of sourceFiles) {
    for (const mod of file.getModules()) {
      if (mod.getName() !== 'global') {
        continue;
      }

      for (const subModule of mod.getModules()) {
        if (subModule.getName() !== 'Remirror') {
          continue;
        }

        console.log(subModule.findReferences().length);

        remirrorModules.push(subModule);
        // log.debug(
        //   `Remirror Module found in ${subModule
        //     .getSourceFile()
        //     .getFilePath()}:${subModule.getStartLineNumber()}`,
        // );
      }
    }

    // for ()
  }

  if (!sourceFile) {
    return;
  }

  const allExports = sourceFile.getExportedDeclarations();

  const extensionDeclaration = allExports.get('Extension')?.[0];
  const node = extensionDeclaration?.compilerNode;
  log.debug({
    equals:
      node ===
      project
        .getSourceFile(
          '/Users/ifiokjr/Coding/KICKJUMP/remirror/remirror/prs/packages/remirror__core/src/extension/extension.ts',
        )
        ?.getClass('Extension')?.compilerNode,
  });
  const allExportSymbols = sourceFile.getExportSymbols();

  // const allGlobalReferences = sourceFile.modul;

  // const context = parser.parseString(content);
  // context.docComment.customBlocks.map((block) => {
  //   block.content.
  // })
}

/**
 * When the exported declaration is a `[ClassDeclaration, InterfaceDeclaration]`
 * then the resulting export should be merged together.
 */
function isMergeDeclarations(declarations: ExportedDeclarations[]) {
  return (
    declarations.length > 1 &&
    declarations.some((declaration) => ClassDeclaration.is(declaration.getKind()))
  );
}

// allExports.get('Extension')[0].getLeadingCommentRanges()[0].getText();
// allExports.get('Extension')[0].getSourceFile().getFilePath();

run();

interface BasicInformation {
  sourceFile: string;
  package: string;
  type: string;
}
