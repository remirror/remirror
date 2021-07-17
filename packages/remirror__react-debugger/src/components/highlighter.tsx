import styled from '@emotion/styled';

import { mainTheme as theme } from '../debugger-constants';

const CustomPre = styled.pre`
  padding: 9px 0 18px 0 !important;
  margin: 0;
  color: ${theme.white80};

  & .prosemirror-dev-tools-highlighter-tag {
    color: ${theme.main};
  }
`;

const regexp = /(&lt;\/?[\s\w"'=]+&gt;)/gim;

function highlight(value: string) {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(regexp, "<span class='prosemirror-dev-tools-highlighter-tag'>$&</span>");
}

interface HighlighterProps {
  children: string | undefined;
}

export const Highlighter = (props: HighlighterProps): JSX.Element | null => {
  if (!props.children) {
    return null;
  }

  return (
    <CustomPre
      dangerouslySetInnerHTML={{
        __html: highlight(props.children),
      }}
    />
  );
};
