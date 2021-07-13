import type * as _t from '@emotion/react'; // For type inference
import styled from '@emotion/styled';
import { Button } from 'reakit/Button';
// import type * as __ from 'reakit-system';
import type * as __t from 'reakit-utils'; // For type inference

import { mainTheme } from '../debugger-constants';

export const Heading = styled.h2`
  color: ${mainTheme.softerMain};
  padding: 0;
  margin: 0;
  font-weight: 400;
  letter-spacing: 1px;
  font-size: 13px;
  text-transform: uppercase;
  flex-grow: 1;
`;

export const HeadingWithButton = styled.div`
  display: flex;
`;

export const HeadingButton = styled.button`
  padding: 6px 10px;
  margin: -6px -10px 0 8px;
  font-weight: 400;
  letter-spacing: 1px;
  font-size: 11px;
  color: ${mainTheme.white80};
  text-transform: uppercase;
  transition: background 0.3s, color 0.3s;
  border-radius: 2px;
  border: none;
  background: transparent;

  &:hover {
    background: ${mainTheme.main40};
    color: ${mainTheme.white};
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${mainTheme.main60};
  }
`;

export const CssReset = styled.div`
  font-size: 100%;
  line-height: 1;

  & li + li {
    margin: 0;
  }
`;

export const InfoPanel = styled.div`
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  color: ${mainTheme.main};
  font-size: 14px;
`;

export const SaveSnapshotButton = styled(Button)`
  position: absolute;
  right: 32px;
  top: -28px;
  color: ${mainTheme.white};
  background: ${mainTheme.main60};
  font-size: 12px;
  line-height: 25px;
  padding: 0 6px;
  height: 24px;
  background-size: 20px 20px;
  background-repeat: none;
  background-position: 50% 50%;
  border-radius: 3px;

  &:hover {
    background-color: ${mainTheme.main80};
    cursor: pointer;
  }
`;

export const SplitView = styled.div`
  display: flex;
  height: 100%;
`;

interface SplitViewColumnProps {
  sep?: boolean;
  grow?: boolean;
  removePadding?: boolean;
  minWidth?: number;
  maxWidth?: number;
}

export const SplitViewColumn = styled.div<SplitViewColumnProps>`
  box-sizing: border-box;
  height: 100%;
  overflow: scroll;
  flex-grow: ${(props) => (props.grow ? 1 : 0)};
  border-left: ${(props) => (props.sep ? `1px solid ${mainTheme.main20}` : 'none')};
  padding: ${(props) => (props.removePadding ? '' : '16px 18px 18px')};
  min-width: ${(props) => (props.minWidth ? `${props.minWidth}px` : 'none')};
  max-width: ${(props) => (props.maxWidth ? `${props.maxWidth}px` : 'none')};
`;

export const FloatingButton = styled.div`
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: ${mainTheme.mainBg};
  box-shadow: 0 0 30px ${mainTheme.black30};
  border-radius: 50%;
  padding: 4px 6px;
  transition: opacity 0.3s;
  z-index: 99999;

  &:hover {
    opacity: 0.7;
    cursor: pointer;
  }

  & svg {
    width: 34px;
    height: 34px;
    position: relative;
    bottom: -2px;
  }
`;

export const DockContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Helvetica Neue', 'Calibri Light', Roboto, sans-serif;
  font-size: 13px;
  background: ${mainTheme.mainBg};
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  position: absolute;
  right: 0;
  font-size: 18px;
  color: ${mainTheme.white60};

  &:hover {
    cursor: pointer;
    background: ${mainTheme.white05};
    color: ${mainTheme.white};
  }

  &:focus {
    outline: none;
  }
`;
