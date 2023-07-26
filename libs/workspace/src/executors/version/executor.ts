import { VersionExecutorSchema } from './schema';

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

  console.log('release', release);
  // update version workspace package.json
  // execute(`npm version ${release}`);
}
