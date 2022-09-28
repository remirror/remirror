import styled from '@emotion/styled';
import React, { FC, ReactNode,RefCallback, useCallback, useEffect, useState } from 'react';

import {useCommandSuggesterContext} from "../command-suggester";

const useTextContent = (): [RefCallback<HTMLElement>, string] => {
  const [textContent, setTextContent] = useState<string>('');

  const ref: React.RefCallback<HTMLElement> = useCallback((node) => {
    if (node !== null) {
      setTextContent(node.textContent ?? '');
    }
  }, []);

  return [ref, textContent];
};

const HiddenDiv = styled.div`
  display: none;
`;

interface CommandMenuItemTextProps {
  commandId?: string;
  label: ReactNode;
  description?: ReactNode | false;
}

export const CommandMenuItemText: FC<CommandMenuItemTextProps> = ({ commandId, label, description }) => {
  const [labelRef, labelText] = useTextContent();
  const [descriptionRef, descriptionText] = useTextContent();
  const {addCommand} = useCommandSuggesterContext() ?? {};

  useEffect(() => {
    if (!addCommand) {
      // No usable context
      return;
    }

    if (!commandId) {
      console.warn('A unique commandId is required for command suggester')
      return;
    }

    if (!labelText) {
      // Have no mounted yet
      return;
    }

    console.log('adding', labelText)
    addCommand({
      commandId,
      label: labelText,
      description: descriptionText
    })
  }, [addCommand, commandId, labelText, descriptionText]);

  return (
    <HiddenDiv>
      <span ref={labelRef}>{label}</span>
      {description && <span ref={descriptionRef}>{description}</span>}
    </HiddenDiv>
  );
};
