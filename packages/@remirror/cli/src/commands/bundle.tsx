import figures from 'figures';
import fs from 'fs';
import { Box, render, Text } from 'ink';
import Spinner from 'ink-spinner';
import escape from 'jsesc';
import ms from 'ms';
import os from 'os';
import Bundler, { ParcelOptions } from 'parcel-bundler';
import path from 'path';
import { FC, useEffect } from 'react';
import useSetState from 'react-use/lib/useSetState';
import rimraf from 'rimraf';
import util from 'util';

import { isNumber, uniqueId } from '@remirror/core-helpers';

import { notifyUpdate } from '../utils';
import { BaseCommand, CommandString, GetShapeOfCommandData } from './base';

const REMIRROR_ID = '__remirror';

/**
 * Create a new monorepo project.
 */
export class BundleCommand extends BaseCommand {
  static usage = BaseCommand.Usage({
    description: 'Bundle a remirror editor for use within a webview.',
    category: 'Bundle',
    details: `
      Bundle your editor.
    `,
    examples: [
      [
        'Quickly create a new monorepo project called awesome with all the default options',
        '$0 bundle src/index.ts',
      ],
      [
        'Bundle an editor from an npm package. Make sure the editor supports being used within a webview. Not all of them do.',
        '$0 create @remirror/react-social',
      ],
    ],
  });

  /**
   * The source of the editor to create. This can be a.
   */
  @BaseCommand.String({ required: true })
  source: CommandString = '';

  @BaseCommand.Path('bundle')
  async execute(): Promise<void> {
    await renderBundleEditor({ ...this, method: bundleEntryPoint });
    notifyUpdate(this.context);
  }
}

/**
 * Create the file which exports a function to be injected into the webview.
 */
const createFile = (withAnnotation = false) => (script: string) => `export const createHTML = ${
  withAnnotation ? '(html: string)' : 'html'
} => \`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>This is the webview</title>
  </head>
  <body>
    <div id="${REMIRROR_ID}">\${html}</div>
  </body>
<script>
  ${escape(script, { quotes: 'backtick', isScriptContext: true })}
</script>
</html>\`;
`;

const createTSFile = createFile(true);
const createJSFile = createFile();

/**
 * Remove all files in the provided path or glob pattern.
 */
function clearPath(glob: string) {
  return new Promise<void>((resolve) => rimraf(glob, () => resolve()));
}

/**
 * Uses parcel-bundler to bundle the target file.
 */
export function bundleEntryPoint({ source, cwd }: BundleCommandShape): BundleMethodReturn {
  const readFile = util.promisify(fs.readFile);
  const writeFile = util.promisify(fs.writeFile);

  // Paths
  const entryFile = path.join(cwd, source);
  const tempDir = path.join(os.tmpdir(), uniqueId());
  const tempFileName = 'remirror-webview.js';
  const tempFilePath = path.join(tempDir, tempFileName);
  const outDir = cwd;
  const isTs = !!source.match(/\.tsx?$/);
  const outFilePath = path.join(outDir, isTs ? 'file.ts' : 'file.js');

  // Parcel config
  const options: ParcelOptions = {
    outDir: tempDir,
    outFile: tempFileName,
    sourceMaps: false,
    minify: true,
    watch: false,
    logLevel: 1,
  };

  const parcel = new Bundler(entryFile, options);

  return {
    bundle: async () => {
      // Create the bundle
      await parcel.bundle();
    },
    write: async () => {
      // Read the bundle and insert it into script template
      const script = await readFile(tempFilePath, 'utf-8');
      const finalOutput = isTs ? createTSFile(script) : createJSFile(script);
      await writeFile(outFilePath, finalOutput, 'utf-8');
    },
    clean: async () => {
      // Remove junk
      await clearPath(`${tempDir}/*`);
    },
  };
}

export type BundleCommandShape = RemirrorCli.Commands['bundle'];
export type BundleEditorProps = BundleCommandShape & { method: BundleMethod; startTime?: number };
export type BundleMethod = (parameter: BundleCommandShape) => BundleMethodReturn;
export interface BundleMethodReturn {
  bundle: () => Promise<void>;
  write: () => Promise<void>;
  clean: () => Promise<void>;
}

enum Step {
  Bundle,
  Write,
  Clean,
  Complete,
}

const messaging = {
  [Step.Bundle]: 'Bundling the editor from the provided entry point.',
  [Step.Write]: 'Writing the generated files to disk.',
  [Step.Clean]: 'Cleaning any temporary files.',
  [Step.Complete]: 'Your bundled editor has successfully been generated.',
};

interface BundleEditorState {
  error?: Error;
  endTime?: number;
  step: Step;
}

const useBundleEditor = ({
  method,
  startTime = Date.now(),
  source,
  cwd,
  verbose,
}: BundleEditorProps) => {
  const [state, setState] = useSetState<BundleEditorState>({ step: Step.Bundle });
  const { endTime } = state;
  const completed = state.step === Step.Complete;

  useEffect(() => {
    const { bundle, write, clean } = method({ source, cwd, verbose });

    bundle()
      .then(() => {
        setState({ step: Step.Write });
        return write();
      })
      .then(() => {
        setState({ step: Step.Clean });
        return clean();
      })
      .then(() => setState({ step: Step.Complete, endTime: Date.now() }))
      .catch((error) => setState({ error: error, endTime: Date.now() }));
  }, [source, method, cwd, verbose, setState]);

  return { ...state, duration: endTime ? endTime - startTime : undefined, completed };
};

/**
 * Renders a loading line
 */
const LoadingLine: FC<BundleEditorState & { value: Step }> = ({ step, error, value, children }) => {
  if (step < value) {
    return null;
  }

  const getElement = () => {
    if (error) {
      return <Text color='red'>{figures.cross}</Text>;
    }

    if (step === value) {
      return <Spinner />;
    }

    return <Text color='green'>{figures.tick}</Text>;
  };

  return (
    <Box height={1}>
      <Box paddingRight={2}>{getElement()}</Box>
      <Text>
        <Text color='grey'>{children}</Text>
      </Text>
    </Box>
  );
};

/**
 * Renders the loading component and timestamp for the command.
 */
export const BundleEditorComponent = ({ verbose, ...props }: BundleEditorProps): JSX.Element => {
  const { completed, duration, ...state } = useBundleEditor({ verbose, ...props });

  return (
    <>
      <LoadingLine {...state} value={Step.Bundle}>
        {messaging[Step.Bundle]}
      </LoadingLine>
      <LoadingLine {...state} value={Step.Write}>
        {messaging[Step.Write]}
      </LoadingLine>
      <LoadingLine {...state} value={Step.Clean}>
        {messaging[Step.Clean]}
      </LoadingLine>
      {completed && (
        <>
          <Box height={1} paddingLeft={3} marginY={1}>
            <Text color='green' bold={true}>
              {messaging[Step.Complete]}
            </Text>
          </Box>
        </>
      )}
      {isNumber(duration) && verbose && (
        <Box height={1} paddingBottom={2}>
          <Box paddingRight={2}>
            <Text color='red'>{figures.info}</Text>
          </Box>
          <Text>Duration: {ms(duration)}</Text>
        </Box>
      )}
    </>
  );
};

/**
 * Runs the renderer for bundling the editor.
 */
export async function renderBundleEditor(props: BundleEditorProps): Promise<void> {
  const { waitUntilExit } = render(<BundleEditorComponent {...props} />);

  await waitUntilExit();
}

declare global {
  namespace RemirrorCli {
    interface Commands {
      bundle: GetShapeOfCommandData<BundleCommand>;
    }
  }
}
