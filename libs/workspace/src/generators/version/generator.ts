import { Tree } from '@nrwl/devkit';
import { VersionGeneratorSchema } from './schema';
import { execute } from '../../executors/publish/util/execute';
import { readFileSync, writeFileSync } from 'fs';
import { visitAllFiles } from '../util/visit-all-files.util';

export default async function (tree: Tree, options: VersionGeneratorSchema) {
  console.log('update version', options);

  try {
    version(tree, options);
  } catch (x) {
    console.error(x);
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}

function version(tree: Tree, options: VersionGeneratorSchema): void {
  const { release } = options;

  // update version workspace package.json
  execute(`npm version ${release}`);

  // read version from package.json
  const globalVersion = JSON.parse(
    readFileSync('package.json').toString()
  ).version;

  visitAllFiles(tree, 'libs', (file) => {
    if (/package\.json/gi.test(file)) {
      const distributablePackage = JSON.parse(readFileSync(file).toString());

      distributablePackage.version = globalVersion;

      writeFileSync(file, JSON.stringify(distributablePackage, null, 2));
    }
  });
  // write version to all package.json files
}
