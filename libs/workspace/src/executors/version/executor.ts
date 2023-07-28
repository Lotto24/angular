import { VersionExecutorSchema } from './schema';
import { execute } from '../util/execute';
import { readFileSync } from 'fs';

export default async function runExecutor(options: VersionExecutorSchema) {
  console.log('Executor ran for version', options);

  try {
    version(options);
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

function version(options: VersionExecutorSchema): void {
  const { release } = options;

  console.log('updating version with release type', release);

  // update version workspace package.json
  execute(`npm version ${release}`);

  const { name, version } = JSON.parse(readFileSync('package.json').toString());
  console.log(`@${name} now at ${version}`);
}
