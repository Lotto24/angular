import { readJson, Tree, writeJsonFile } from '@nrwl/devkit';
import { VersionGeneratorSchema } from './schema';
import { visitAllFiles } from '../util/visit-all-files.util';
import { execute } from '../util/execute';

export default async function (tree: Tree, options: VersionGeneratorSchema) {
  console.log('update version', options);

  try {
    version(tree, options);
  } catch (x) {
    console.error(x);
  }
}

function version(tree: Tree, options: VersionGeneratorSchema): void {
  const { release } = options;

  // update version workspace package.json
  execute(`npm version ${release}`);

  const globalVersion = readJson(tree, 'package.json').version;
  console.log('globalVersion', globalVersion);

  // write version to all package.json files
  visitAllFiles(tree, 'libs', (file) => {
    if (/\/package\.json$/gi.test(file)) {
      console.log(file);
      const distributablePackage = readJson(tree, file);
      distributablePackage.version = globalVersion;
      writeJsonFile(file, distributablePackage);
    }
  });
}
