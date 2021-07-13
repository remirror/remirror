import { Option } from 'clipanion';
import figures from 'figures';
import { readFile, writeFile } from 'fs-extra';
import { Box, render, Text } from 'ink';
import Spinner from 'ink-spinner';
import escape from 'jsesc';
import ms from 'ms';
import os from 'os';
import path from 'path';
import { FC, useEffect } from 'react';
import useSetState from 'react-use/lib/useSetState';
import rimraf from 'rimraf';
import type { RollupOptions } from 'rollup';
import { isNumber, uniqueId } from '@remirror/core-helpers';

import { notifyUpdate } from '../cli-utils';
import { BaseCommand, CommandBoolean, CommandString, GetShapeOfCommandData } from './base-command';

/**
 * Create a new monorepo project.
 */
export class BundleCommand extends BaseCommand {
  static paths = [['bundle']];

  static usage = BaseCommand.Usage({
    description: 'Bundle a remirror editor for use within a webview.',
    category: 'Bundle',
    details: `
      Bundle your editor.
    `,
    examples: [
      [
        'Quickly create a new monorepo project called awesome with all the default options',
        '$0 bundle --src src/index.ts --dest src/bundled.ts',
      ],
    ],
  });

  /**
   * The source of the editor to create. This can be a.
   */
  source: CommandString = Option.String('--source,--src,-s', {
    description: 'The relative path to the source file',
    required: true,
  });

  destination: CommandString = Option.String('--destination,--dest,-d', {
    description: 'The relative path to the destination file',
    required: true,
  });

  watch?: CommandBoolean = Option.Boolean('--watch,-w', {
    required: false,
    description: 'Active watching for the source file',
  });

  async execute(): Promise<void> {
    await renderBundleEditor({ ...this, method: bundleEntryPoint });
    notifyUpdate(this.context);
  }
}

/**
 * Create the file which exports a function to be injected into the webview.
 */
const createFileContents = (script: string) =>
  `export default \`${escape(script, { quotes: 'backtick', isScriptContext: false })}\``;

/**
 * Remove all files in the provided path or glob pattern.
 */
function clearPath(glob: string) {
  return new Promise<void>((resolve) => rimraf(glob, () => resolve()));
}

/**
 * Uses parcel-bundler to bundle the target file.
 */
export function bundleEntryPoint(props: BundleCommandShape) {
  const { source, cwd, destination } = props;

  // Paths
  const entryFile = path.join(cwd, source);
  const tempDir = path.join(os.tmpdir(), uniqueId());
  const tempFileName = 'remirror-webview.js';
  const tempFilePath = path.join(tempDir, tempFileName);
  const outFilePath = path.join(cwd, destination);

  return {
    bundle: async () => {
      const { rollup } = await import('rollup');
      const { babel } = await import('@rollup/plugin-babel');
      const { default: json } = await import('@rollup/plugin-json');
      const { default: cjs } = await import('@rollup/plugin-commonjs');
      const { terser } = await import('rollup-plugin-terser');
      const { nodeResolve } = await import('@rollup/plugin-node-resolve');

      const extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.node'];
      const options: RollupOptions = {
        input: entryFile,
        plugins: [
          cjs({ extensions, include: /node_modules/ }),
          babel({ cwd, extensions, babelHelpers: 'runtime', rootMode: 'upward-optional' }),
          json({ namedExports: false }),
          nodeResolve({ extensions, browser: true, preferBuiltins: true }),
        ],
      };

      if (process.env.NODE_ENV === 'production') {
        options.plugins?.push(terser());
      }

      const bundler = await rollup(options);

      const result = await bundler.generate({
        format: 'iife',
        exports: 'named',
        name: 'AWESOME',
      });

      return writeFile(outFilePath, result.output[0].code);
    },
    write: async () => {
      // Read the bundle and insert it into script template
      const script = await readFile(tempFilePath, 'utf-8');
      const finalOutput = createFileContents(script);
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
export type BundleMethod = (props: BundleCommandShape) => BundleMethodReturn;
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

function useBundleEditor(props: BundleEditorProps) {
  const { method, startTime = Date.now(), source, destination, cwd, verbose } = props;
  const [state, setState] = useSetState<BundleEditorState>({ step: Step.Bundle });
  const { endTime, step } = state;
  const completed = step === Step.Complete;

  useEffect(() => {
    const { bundle, write, clean } = method({ source, cwd, verbose, destination });

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
  }, [source, method, cwd, verbose, setState, destination]);

  return { ...state, duration: endTime ? endTime - startTime : undefined, completed };
}

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
export const BundleEditorComponent = (props: BundleEditorProps): JSX.Element => {
  const { completed, duration, ...state } = useBundleEditor(props);

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
      {isNumber(duration) && props.verbose && (
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
