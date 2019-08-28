import figures from 'figures';
import { Box, Color, Text } from 'ink';
import Spinner from 'ink-spinner';
import React, { FC, useEffect } from 'react';
import useSetState from 'react-use/lib/useSetState';
import { msToDuration } from '../cli-utils';
import { BundleArgv } from './cli-types';

export interface BundleProps {
  runBundler(): Promise<void>;
  args: BundleArgv;
  startTime?: number;
}

export interface BundleState {
  completed: boolean;
  error?: Error;
  endTime?: number;
}

/**
 * Renders the loading component and timestamp for the command.
 */
export const Bundle = ({ args, startTime = Date.now(), runBundler }: BundleProps) => {
  const [state, setState] = useSetState<BundleState>({ completed: false });
  const { completed, endTime } = state;

  useEffect(() => {
    runBundler()
      .then(() => setState({ completed: true, endTime: Date.now() }))
      .catch(e => setState({ error: e, completed: true }));
  }, []);

  return (
    <>
      <Box height={endTime ? 1 : 2}>
        <LoadingLine {...state}>Bundling {args.source}</LoadingLine>
      </Box>
      {endTime && (
        <Box height={2}>
          <Box paddingRight={2}>✨</Box>
          <Color bold={true} green={true}>
            Built in {msToDuration(endTime - startTime)}.
          </Color>
        </Box>
      )}
      {completed && (
        <Box>
          <Color green={true}>Successfully bundled</Color> {args.source}
        </Box>
      )}
    </>
  );
};

/**
 * Renders a loading line
 */
const LoadingLine: FC<BundleState> = ({ completed, error, children }) => (
  <>
    <Box paddingRight={2}>
      {!completed ? (
        <Spinner />
      ) : completed && !error ? (
        <Color green={true}>{figures.tick}</Color>
      ) : (
        <Color red={true}>{figures.cross}</Color>
      )}
    </Box>
    <Text>
      <Color grey={true}>{children}</Color>
    </Text>
  </>
);
