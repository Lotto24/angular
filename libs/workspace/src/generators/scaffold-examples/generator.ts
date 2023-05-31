import {formatFiles, Tree,} from '@nx/devkit';
import {ScaffoldExamplesGeneratorSchema} from './schema';
import {componentGenerator, libraryGenerator, UnitTestRunner} from "@nx/angular/generators";
import {Schema as NxAngularLibrarySchema} from "@nx/angular/src/generators/library/schema";
import {Schema as NxAngularComponentSchema} from "@nx/angular/src/generators/component/schema";
import {FileUpdates, ModuleGeneratorUtil, updateSourceFiles} from "../util/ts-morph.util";
import {ts} from "ts-morph";

interface ExamplesScaffolderLibrary {
  name: string;
  bloatSizeKb: number;
  type: 'standalone' | 'ng-module-bootstrap'
}

const structure: ExamplesScaffolderLibrary[] = [
  {
    name: 'home0',
    bloatSizeKb: 24,
    type: 'standalone',
  },
  {
    name: 'home1',
    bloatSizeKb: 32,
    type: 'standalone',
  },
  {
    name: 'home2',
    bloatSizeKb: 16,
    type: 'standalone',
  },
  {
    name: 'home3',
    bloatSizeKb: 16,
    type: 'ng-module-bootstrap',
  },

  {
    name: 'fruit0',
    bloatSizeKb: 32,
    type: 'standalone',
  },
  {
    name: 'fruit1',
    bloatSizeKb: 127,
    type: 'standalone',
  },
  {
    name: 'fruit2',
    bloatSizeKb: 96,
    type: 'standalone',
  },
  {
    name: 'fruit3',
    bloatSizeKb: 72,
    type: 'standalone',
  },
  {
    name: 'fruit4',
    bloatSizeKb: 16,
    type: 'standalone',
  },
  {
    name: 'fruit5',
    bloatSizeKb: 48,
    type: 'standalone',
  },
  {
    name: 'fruit6',
    bloatSizeKb: 84,
    type: 'standalone',
  },
  {
    name: 'fruit7',
    bloatSizeKb: 112,
    type: 'standalone',
  },
]

export default async function (
  tree: Tree,
  options: ScaffoldExamplesGeneratorSchema
) {
  for (const lib of structure) {
    await createLibrary(tree, options.namespace, lib);
  }
  await formatFiles(tree);
}

async function createLibrary(tree: Tree, namespace: string, library: ExamplesScaffolderLibrary): Promise<void> {
  const schema: NxAngularLibrarySchema = {
    name: library.name,
    flat: true,
    importPath: undefined,
    standalone: false,
    directory: namespace,
    prefix: namespace,
    unitTestRunner: UnitTestRunner.None,
    skipModule: library.type !== 'ng-module-bootstrap',
  }

  await libraryGenerator(tree, schema)

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
  }
  await componentGenerator(tree, componentSchema)
  await bloatTemplates(tree, library);

  if (library.type === 'ng-module-bootstrap') {
    addComponentToNgModuleBootstrap(tree, library);
  }
}

async function bloatTemplates(tree: Tree, library: ExamplesScaffolderLibrary): Promise<void> {
  const directory = 'examples';
  const templatePath = `libs/${directory}/${library.name}/src/lib/${directory}-${library.name}.component.html`
  const bloat = await createBlob(library.bloatSizeKb * 1024).text();
  tree.write(templatePath, `<div data-bloat="${bloat}">${library.name} (bs=${library.bloatSizeKb}kB)</div>`)
}

function addComponentToNgModuleBootstrap(tree: Tree, library: ExamplesScaffolderLibrary): Tree {
  const directory = 'examples';
  const ngModulePath = `libs/${directory}/${library.name}/src/lib/${directory}-${library.name}.module.ts`;

  const updates: FileUpdates = {
    [ngModulePath]: sourceFile => {
      const decorator = ModuleGeneratorUtil.findModuleClass(sourceFile, 'NgModule');
      const objLiteral = decorator?.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression);

      if (!objLiteral) {
        return;
      }

      const value = objLiteral.getPropertyOrThrow('exports');
      objLiteral.addProperty(writer => writer.write(value.getFullText().replace(/exports/, 'bootstrap')));

    },
  };

  updateSourceFiles(tree, updates);

  return tree;
}

function createBlob(size: number): Blob {
  const buffer = Buffer.alloc(size, 'abc');
  return new Blob([buffer], {type: 'application/octet-stream'});
}
