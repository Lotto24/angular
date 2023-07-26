import { PublishExecutorSchema } from './schema';
import { execute } from './util/execute';
import { readFileSync, writeFileSync } from 'fs';
import { joinPathFragments } from '@nrwl/devkit';

export default async function runExecutor(options: PublishExecutorSchema) {
  console.log('Executor ran for Publish', options);

  try {
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

function publish(options: PublishExecutorSchema): void {
  const { path, registry, tag, access, dryRun } = options;
  execute(`npm publish ${path}`, {
    registry,
    tag,
    access,
    dryRun,
  });
}
