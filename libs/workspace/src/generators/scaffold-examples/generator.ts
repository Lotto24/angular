import { formatFiles, Tree } from '@nrwl/devkit';
import { ScaffoldExamplesGeneratorSchema } from './schema';
import {
  componentGenerator,
  libraryGenerator,
  UnitTestRunner,
} from '@nx/angular/generators';
import { Schema as NxAngularLibrarySchema } from '@nx/angular/src/generators/library/schema';
import { Schema as NxAngularComponentSchema } from '@nx/angular/src/generators/component/schema';
import {
  FileUpdates,
  ModuleGeneratorUtil,
  updateSourceFiles,
} from '../util/ts-morph.util';
import { ts } from 'ts-morph';
import { Blob } from 'buffer';
import * as fs from 'fs';

interface ExamplesScaffolderLibrary {
  name: string;
  bloatSizeKb: number;
  type: 'standalone' | 'ng-module-bootstrap';
}

export default async function (
  tree: Tree,
  options: ScaffoldExamplesGeneratorSchema
) {
  let file: Buffer;
  try {
    file = fs.readFileSync(options.path);
  } catch (x) {
    throw new Error(`could not read template file at path ${options.path}`);
  }

  const structure: ExamplesScaffolderLibrary[] = JSON.parse(file.toString());

  for (const lib of structure) {
    await createLibrary(tree, options.namespace, lib);
  }
  await formatFiles(tree);
}

async function createLibrary(
  tree: Tree,
  namespace: string,
  library: ExamplesScaffolderLibrary
): Promise<void> {
  const schema: NxAngularLibrarySchema = {
    name: library.name,
    flat: true,
    importPath: undefined,
    standalone: false,
    directory: namespace,
    prefix: namespace,
    unitTestRunner: UnitTestRunner.None,
    skipModule: library.type !== 'ng-module-bootstrap',
  };

  await libraryGenerator(tree, schema);

  const componentSchema: NxAngularComponentSchema = {
    name: `${namespace}-${library.name}`,
    prefix: namespace,
    selector: `${namespace}-${library.name}-component`,
    project: `${namespace}-${library.name}`,
    changeDetection: 'OnPush',
    export: true,
    style: 'scss',
    flat: true,
    skipTests: true,
    inlineStyle: true,

    standalone: library.type === 'standalone',
  };
  await componentGenerator(tree, componentSchema);
  await bloatTemplates(tree, library, namespace);

  if (library.type === 'ng-module-bootstrap') {
    addComponentToNgModuleBootstrap(tree, library, namespace);
  }
}

async function bloatTemplates(
  tree: Tree,
  library: ExamplesScaffolderLibrary,
  namespace: string
): Promise<void> {
  const templatePath = `libs/${namespace}/${library.name}/src/lib/${namespace}-${library.name}.component.html`;
  const bloat = await createBlob(library.bloatSizeKb * 1024).text();
  tree.write(
    templatePath,
    `<div data-bloat="${bloat}">${library.name} (bs=${library.bloatSizeKb}kB)</div>`
  );
}

function addComponentToNgModuleBootstrap(
  tree: Tree,
  library: ExamplesScaffolderLibrary,
  namespace: string
): Tree {
  const ngModulePath = `libs/${namespace}/${library.name}/src/lib/${namespace}-${library.name}.module.ts`;
  console.log('ngModulePath', ngModulePath);
  const updates: FileUpdates = {
    [ngModulePath]: (sourceFile) => {
      const decorator = ModuleGeneratorUtil.findModuleClass(
        sourceFile,
        'NgModule'
      );

      const objLiteral = decorator?.getFirstDescendantByKind(
        ts.SyntaxKind.ObjectLiteralExpression
      );

      if (!objLiteral) {
        console.log('NgModule configuration not found');
        return;
      }

      const value = objLiteral.getPropertyOrThrow('exports');
      objLiteral.addProperty((writer) =>
        writer.write(value.getFullText().replace(/exports/, 'bootstrap'))
      );
    },
  };

  updateSourceFiles(tree, updates);

  return tree;
}

function createBlob(size: number): Blob {
  const buffer = Buffer.alloc(size, 'abc');
  return new Blob([buffer], { type: 'application/octet-stream' });
}
