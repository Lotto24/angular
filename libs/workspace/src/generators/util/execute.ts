import { toKebabCase } from './to-kebab-case';
import { execSync } from 'child_process';

export function execute(
  cmd: string,
  args: Record<string, string | boolean | number> = {}
): Buffer {
  const interpolated = Object.entries(args)
    .map(([k, v]) => [toKebabCase(k), v])
    .reduce((r, [arg, value]) => `${r} --${arg}=${value}`, cmd);

  console.log(`> ${interpolated}`);
  return execSync(interpolated);
}
