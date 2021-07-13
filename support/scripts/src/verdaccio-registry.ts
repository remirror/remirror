// import chalk from 'chalk';
// import { exec } from 'child_process';
// import detectFreePort from 'detect-port';
// import fs from 'fs';
// import yaml from 'js-yaml';
// import nodeCleanup from 'node-cleanup';
// import pLimit from 'p-limit';
// import path from 'path';
// import dedent from 'ts-dedent';
// import startVerdaccioServer from 'verdaccio';

// // @ts-ignore
// import { maxConcurrentTasks } from './utils/concurrency';
// import { listOfPackages, Package } from './utils/list-packages';

// program
//   .option('-O, --open', 'keep process open')
//   .option('-P, --publish', 'should publish packages')
//   .option('-p, --port <port>', 'port to run https server on');

// program.parse(process.argv);

// const logger = console;

// const freePort = (port?: number) => port || detectFreePort(port);

// const startVerdaccio = (port: number) => {
//   let resolved = false;
//   return Promise.race([
//     new Promise((resolve) => {
//       const cache = path.join(__dirname, '..', '.verdaccio-cache');
//       const config = {
//         ...(yaml.safeLoad(
//           fs.readFileSync(path.join(__dirname, 'verdaccio.yaml'), 'utf8'),
//         ) as Record<string, any>),
//         self_path: cache,
//       };

//       const onReady = (webServer: any) => {
//         webServer.listen(port, () => {
//           resolved = true;
//           resolve(webServer);
//         });
//       };

//       startVerdaccioServer(config, 6000, cache, '1.0.0', 'verdaccio', onReady);
//     }),
//     new Promise((_, rej) => {
//       setTimeout(() => {
//         if (!resolved) {
//           resolved = true;
//           rej(new Error(`TIMEOUT - verdaccio didn't start within 10s`));
//         }
//       }, 10_000);
//     }),
//   ]);
// };
// const registryUrl = (command: string, url?: string) =>
//   new Promise<string>((res, rej) => {
//     const args = url ? ['config', 'set', 'registry', url] : ['config', 'get', 'registry'];
//     exec(`${command} ${args.join(' ')}`, (e, stdout) => {
//       if (e) {
//         rej(e);
//       } else {
//         res(url || stdout.toString().trim());
//       }
//     });
//   });

// const registriesUrl = (yarnUrl?: string, npmUrl?: string) =>
//   Promise.all([registryUrl('yarn', yarnUrl), registryUrl('npm', npmUrl || yarnUrl)]);

// const applyRegistriesUrl = (
//   yarnUrl: string,
//   npmUrl: string,
//   originalYarnUrl: string,
//   originalNpmUrl: string,
// ) => {
//   logger.log(`↪️  changing system config`);
//   nodeCleanup(() => {
//     registriesUrl(originalYarnUrl, originalNpmUrl);

//     logger.log(dedent`
//       Your registry config has been restored from:
//       npm: ${npmUrl} to ${originalNpmUrl}
//       yarn: ${yarnUrl} to ${originalYarnUrl}
//     `);
//   });

//   return registriesUrl(yarnUrl, npmUrl);
// };

// const currentVersion = async () => {
//   const { version } = (await import('../lerna.json')).default;
//   return version;
// };

// const publish = (packages: Array<{ name: string; location: string }>, url: string) => {
//   logger.log(`Publishing packages with a concurrency of ${maxConcurrentTasks}`);

//   const limit = pLimit(maxConcurrentTasks);
//   let i = 0;

//   return Promise.all(
//     packages.map(({ name, location }) =>
//       limit(
//         () =>
//           new Promise((res, rej) => {
//             logger.log(`🛫 publishing ${name} (${location})`);
//             const command = `cd ${location} && npm publish --registry ${url} --force --access restricted --ignore-scripts`;
//             exec(command, (e) => {
//               if (e) {
//                 rej(e);
//               } else {
//                 i += 1;
//                 logger.log(`${i}/${packages.length} 🛬 successful publish of ${name}!`);
//                 res();
//               }
//             });
//           }),
//       ),
//     ),
//   );
// };

// const run = async () => {
//   const port = await freePort(program.port);
//   logger.log(`🌏 found a open port: ${port}`);

//   const verdaccioUrl = `http://localhost:${port}`;

//   logger.log(`🔖 reading current registry settings`);
//   let [originalYarnRegistryUrl, originalNpmRegistryUrl] = await registriesUrl();

//   if (
//     originalYarnRegistryUrl.includes('localhost') ||
//     originalNpmRegistryUrl.includes('localhost')
//   ) {
//     originalYarnRegistryUrl = 'https://registry.npmjs.org/';
//     originalNpmRegistryUrl = 'https://registry.npmjs.org/';
//   }

//   logger.log(`📐 reading version of storybook`);
//   logger.log(`🚛 listing storybook packages`);
//   logger.log(`🎬 starting verdaccio (this takes ±5 seconds, so be patient)`);

//   const [verdaccioServer, packages, version] = await Promise.all<any, Package[], string>([
//     startVerdaccio(port),
//     listOfPackages(),
//     currentVersion(),
//   ]);

//   logger.log(`🌿 verdaccio running on ${verdaccioUrl}`);

//   await applyRegistriesUrl(
//     verdaccioUrl,
//     verdaccioUrl,
//     originalYarnRegistryUrl,
//     originalNpmRegistryUrl,
//   );

//   // await addUser(verdaccioUrl);

//   logger.log(`📦 found ${packages.length} storybook packages at version ${chalk.blue(version)}`);

//   if (program.publish) {
//     await publish(packages, verdaccioUrl);
//   }

//   if (!program.open) {
//     verdaccioServer.close();
//   }
// };

// run().catch((error) => {
//   logger.error(error);
//   process.exit(1);
// });

export {};
