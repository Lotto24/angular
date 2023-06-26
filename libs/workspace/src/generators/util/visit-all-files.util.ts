import {joinPathFragments, Tree} from "@nrwl/devkit";

export function visitAllFiles(tree: Tree, path: string, callback: (path: string) => void) {
  const children = tree.children(path);
  if (children.length === 0) {
    callback(path);
  } else {
    children.forEach(child => visitAllFiles(tree, joinPathFragments(path, child), callback));
  }
}
