/**
 * @module
 *
 * The combined playground component.
 *
 * @jsxImportSource @emotion/react
 */

import styled from '@emotion/styled';

import { ConfigurationProvider } from '../playground-state';
import { LoadableCodeEditor, LoadableRenderEditor } from './loadables';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
`;

/**
 * The playground layouts.
 */
export const Playground = () => {
  return (
    <ConfigurationProvider>
      <Container>
        <LoadableCodeEditor />
        <LoadableRenderEditor />
      </Container>
    </ConfigurationProvider>
  );
};
