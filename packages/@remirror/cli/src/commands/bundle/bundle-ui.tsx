import figures from 'figures';
import { Box, Color, render, Text } from 'ink';
import Spinner from 'ink-spinner';
import ms from 'ms';
import React, { FC, useEffect } from 'react';
import useSetState from 'react-use/lib/useSetState';

import { isNumber } from '@remirror/core-helpers';

import { BundleEditorProps } from './bundle-types';

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
      return <Color red={true}>{figures.cross}</Color>;
    }

    if (step === value) {
      return <Spinner />;
    }

    return <Color green={true}>{figures.tick}</Color>;
  };

  return (
    <Box height={1}>
      <Box paddingRight={2}>{getElement()}</Box>
      <Text>
        <Color grey={true}>{children}</Color>
      </Text>
    </Box>
  );
};

/**
 * Renders the loading component and timestamp for the command.
 */
export const BundleEditor = ({ verbose, ...props }: BundleEditorProps) => {
  const { completed, duration, ...state } = useBundleEditor({
    verbose,
    ...props,
  });

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
            <Color green={true} bold={true}>
              {messaging[Step.Complete]}
            </Color>
          </Box>
        </>
      )}
      {isNumber(duration) && verbose && (
        <Box height={1} paddingBottom={2}>
          <Box paddingRight={2}>
            <Color blue={true}>{figures.info}</Color>
          </Box>
          <Color>Duration: {ms(duration)}</Color>
        </Box>
      )}
    </>
  );
};

export const renderBundleEditor = async (props: BundleEditorProps) => {
  const { waitUntilExit } = render(<BundleEditor {...props} />);

  await waitUntilExit();
};
