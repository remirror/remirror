const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');
const {
  baseDir,
  getAllDependencies,
  getRelativePathFromJson,
  exec,
  // formatFiles,
} = require('./helpers');
// const { sep } = require('path');
const argv = require('yargs').argv;

const generateDocs = async (inputFolder = '', packageName = '') => {
  const outputFolder = baseDir('docs/api', packageName);
  await exec(
    `api-documenter markdown --input-folder ${inputFolder} --output-folder ${outputFolder}`,
  );
};

const getPackages = () =>
  getAllDependencies().then(packages => {
    return packages.filter(
      pkg => !pkg.private && pkg.types && !(pkg.meta && pkg.meta.skipApi),
    );
  });

const runApiExtractor = async () => {
  const packages = await getPackages();

  packages.forEach(json => {
    const relativePath = getRelativePathFromJson(json);
    const path = baseDir(relativePath, 'api-extractor.json');

    console.log(path);

    const config = ExtractorConfig.loadFileAndPrepare(path);
    const result = Extractor.invoke(config, {
      localBuild: true,
      showVerboseMessages: true,
      typescriptCompilerFolder: baseDir('node_modules', 'typescript'),
    });

    if (result.succeeded) {
      console.info(
        `API Extractor completed successfully with ${result.warningCount} warnings: ${json.name}`,
      );
    } else {
      console.error(
        `API Extractor completed with ${result.errorCount} errors and ${result.warningCount} warnings: ${json.name}`,
      );
      process.exitCode = 1;
    }
  });
};

const runApiDocumenter = async () => {
  const packages = await getPackages();
  const paths = packages.map(json => ({
    input: baseDir(getRelativePathFromJson(json), 'temp'),
    name: json.name,
  }));

  await Promise.all(paths.map(path => generateDocs(path.input, path.name)));
  // await formatFiles(baseDir('docs/api', '**/*.md'));
  // await Promise.all(
  //   paths.map(path => formatFiles(`${baseDir('docs/api', path.name)}${sep}/*.md`)),
  // );
};

const run = async () => {
  if (argv.all || !argv.docs) {
    await runApiExtractor();
  }

  if (argv.all || !argv.api) {
    await runApiDocumenter();
  }
};

run();
