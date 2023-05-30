import {formatFiles, Tree, updateJson,} from '@nx/devkit';
import {ScaffoldExamplesGeneratorSchema} from './schema';
import {componentGenerator, libraryGenerator, UnitTestRunner} from "@nx/angular/generators";
import {Schema as NxAngularLibrarySchema} from "@nx/angular/src/generators/library/schema";
import {Schema as NxAngularComponentSchema} from "@nx/angular/src/generators/component/schema";

interface ExamplesScaffolderLibrary {
  name: string;
  bloatSizeKb: number;
  type: 'standalone' | 'ng-module-bootstrap'
}

const structure: ExamplesScaffolderLibrary[] = [
  {
    name: 'example0',
    bloatSizeKb: 24,
    type: 'standalone',
  },
  {
    name: 'example1',
    bloatSizeKb: 32,
    type: 'standalone',
  },
  {
    name: 'example2',
    bloatSizeKb: 16,
    type: 'standalone',
  },
  {
    name: 'example3',
    bloatSizeKb: 16,
    type: 'ng-module-bootstrap',
  }
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
}

async function bloatTemplates(tree: Tree, library: ExamplesScaffolderLibrary): Promise<void> {
  const directory = 'examples';
  const templatePath = `libs/${directory}/${library.name}/src/lib/${directory}-${library.name}.component.html`
  const bloat = await createBlob(library.bloatSizeKb * 1024).text();
  tree.write(templatePath, `<div data-bloat="${bloat}">${library.name} (bs=${library.bloatSizeKb}kB)</div>`)
}

function createBlob(size: number): Blob {
  const buffer = Buffer.alloc(size, 'abc');
  return new Blob([buffer], {type: 'application/octet-stream'});
}
