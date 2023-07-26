import { PublishExecutorSchema } from './schema';
import { execute } from '../util/execute';
import { readFileSync, writeFileSync } from 'fs';
import { joinPathFragments } from '@nrwl/devkit';

export default async function runExecutor(options: PublishExecutorSchema) {
  console.log('Executor ran for Publish', options);

  try {
    version(options);
    publish(options);
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

function version(options: PublishExecutorSchema): void {
  const { path } = options;

  // read version from package.json
  const { version, name } = JSON.parse(readFileSync('package.json').toString());

  // write version to distributable's package.json
  const pathToDistributablePackage = joinPathFragments(path, 'package.json');
  const distributablePackage = JSON.parse(
    readFileSync(pathToDistributablePackage).toString()
  );

  const namespace = `@${name}`;
  distributablePackage.version = version;
  distributablePackage.devDependencies = versionDependencies(
    distributablePackage.devDependencies,
    namespace,
    version
  );
  distributablePackage.peerDependencies = versionDependencies(
    distributablePackage.peerDependencies,
    namespace,
    version
  );
  distributablePackage.dependencies = versionDependencies(
    distributablePackage.dependencies,
    namespace,
    version
  );

  writeFileSync(
    pathToDistributablePackage,
    JSON.stringify(distributablePackage, null, 2)
  );
}

function publish(options: PublishExecutorSchema): void {
  const { path, registry, tag, access, dryRun } = options;
  execute(`npm publish ${path}`, {
    registry,
    tag,
    access,
    dryRun,
  });
}

function versionDependencies(
  deps: Record<string, string> | undefined,
  namespace: string,
  version: string
): Record<string, string> | undefined {
  if (!deps) {
    return undefined;
  }

  return Object.entries(deps).reduce((r, [key, value]) => {
    if (key.startsWith(namespace)) {
      r = {
        ...r,
        [key]: version,
      };
    }
    return r;
  }, {});
}
