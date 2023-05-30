import type {Tree} from '@nrwl/devkit';
import type {ClassDeclaration, SourceFile} from 'ts-morph';
import {Project} from 'ts-morph';
import * as ts from 'typescript';

export type UpdateFileContent = (sourceFile: SourceFile) => void;
export type FileUpdates = Record<string, UpdateFileContent>;
export type UpdateFileDelegate = (tree: Tree, project: Project) => void;

function updateFile(path: string, updateFileContent: UpdateFileContent): UpdateFileDelegate {
  return (tree: Tree, project): void => {
    const fileContent = tree.read(path)?.toString('utf-8');
    const sourceFile = project.createSourceFile(path, fileContent);

    updateFileContent(sourceFile);
    sourceFile.saveSync();
  };
}

export const updateSourceFiles = (tree: Tree, fileUpdates: FileUpdates) => {
  const project = new Project({ useInMemoryFileSystem: true });
  const fs = project.getFileSystem();
  Object.keys(fileUpdates).forEach(path => {
    const fileUpdate = updateFile(path, fileUpdates[path]);

    fileUpdate(tree, project);
    tree.write(path, fs.readFileSync(path));
  });
};

export class ModuleGeneratorUtil {
  public static findModuleClass(
    sourceFile: SourceFile,
    decorator: 'NgModule' | 'Module' = 'NgModule'
  ): ClassDeclaration | undefined {
    return sourceFile.getDescendantsOfKind(ts.SyntaxKind.ClassDeclaration).find(p => p.getDecorator(decorator));
  }
}
