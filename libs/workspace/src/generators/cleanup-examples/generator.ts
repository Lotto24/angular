import {formatFiles, Tree, updateJson,} from '@nrwl/devkit';
import {CleanupExamplesGeneratorSchema} from './schema';

export default async function (
  tree: Tree,
  options: CleanupExamplesGeneratorSchema
) {
  await cleanUpNamespace(tree, options.namespace);
  await formatFiles(tree);
}

async function cleanUpNamespace(tree: Tree, namespace: string): Promise<void> {
  cleanUpLibraries(tree, namespace);
  await updateJson(tree, 'tsconfig.base.json', createTsConfigBaseCleanupUpdaterFn(namespace));
}

function cleanUpLibraries(tree: Tree, namespace: string): void {
  const directory = `libs/${namespace}`;
  tree.delete(directory);
}

function createTsConfigBaseCleanupUpdaterFn(namespace: string): (tsConfigBase: any) => any {
  return (tsConfigBase) => {
    tsConfigBase.compilerOptions.paths = Object.entries(tsConfigBase.compilerOptions.paths).reduce((r, [key, value]) => {
      if (key.includes(namespace)) {
        return r;
      }

      return {
        ...r,
        [key]: value
      };
    }, {});

    return tsConfigBase;
  }
}
