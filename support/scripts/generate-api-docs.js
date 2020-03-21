const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');
const {
  baseDir,
  getAllDependencies,
  getRelativePathFromJson,
  exec,
  // formatFiles,
} = require('./helpers');
const argv = require('yargs').argv;

const { check, all, api, docs } = argv;

const generateDocs = async (inputFolder = '', packageName = '') => {
  const outputFolder = baseDir('docs/api', packageName);
  await exec(
    `api-documenter markdown --input-folder ${inputFolder} --output-folder ${outputFolder}`,
  );
};

const getPackages = () =>
  getAllDependencies().then((packages) => {
    return packages.filter((pkg) => !pkg.private && pkg.types && !(pkg.meta && pkg.meta.skipApi));
  });

const runApiExtractor = async () => {
  const packages = await getPackages();

  packages.forEach((json) => {
    const relativePath = getRelativePathFromJson(json);
    const configObjectFullPath = baseDir(relativePath, 'api-extractor.json');

    console.log(configObjectFullPath, relativePath);

    const configObject = ExtractorConfig.loadFile(configObjectFullPath);
    const extractor = ExtractorConfig.prepare({
      configObject,
      configObjectFullPath,
      packageJson: json,
      packageJsonFullPath: baseDir(relativePath, 'package.json'),
    });

    const result = Extractor.invoke(extractor, {
      localBuild: !check,
      // showVerboseMessages: true,
      typescriptCompilerFolder: baseDir('node_modules', 'typescript'),
    });

    if (result.succeeded) {
      console.info(
        `API Extractor completed successfully with ${result.warningCount} warnings: ${json.name}`,
      );
    } else if (check && result.apiReportChanged) {
      console.error(
        `API Extractor completed with ${result.errorCount} errors and ${result.warningCount} warnings: ${json.name}
        \n\nRun yarn generate:api to fix this.\n\n`,
      );
      process.exitCode = 1;
    }
  });
};

const runApiDocumenter = async () => {
  const packages = await getPackages();
  const paths = packages.map((json) => ({
    input: baseDir(getRelativePathFromJson(json), 'temp'),
    name: json.name,
  }));

  await Promise.all(paths.map((path) => generateDocs(path.input, path.name)));
  // await formatFiles(baseDir('docs/api', '**/*.md'));
  // await Promise.all(
  //   paths.map(path => formatFiles(`${baseDir('docs/api', path.name)}${sep}/*.md`)),
  // );
};

const run = async () => {
  if (all || !docs) {
    await runApiExtractor();
  }

  if (all || !api) {
    await runApiDocumenter();
  }
};

run();
