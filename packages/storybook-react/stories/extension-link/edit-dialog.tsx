import { css } from '@emotion/css';
import type { ChangeEvent, HTMLProps, KeyboardEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createMarkPositioner,
  LinkExtension,
  ShortcutHandlerProps,
  StringPositioner,
} from 'remirror/extensions';
import { cx } from '@remirror/core';
import {
  EditorComponent,
  FloatingWrapper,
  Remirror,
  ThemeProvider,
  useActive,
  useAttrs,
  useChainedCommands,
  useCurrentSelection,
  useExtension,
  useExtensionEvent,
  useRemirror,
} from '@remirror/react';
import { PositionerPortal, useCommands, usePositioner } from '@remirror/react';
import { CommandButton, FloatingToolbar } from '@remirror/react-ui';

function useLinkShortcut() {
  const [linkShortcut, setLinkShortcut] = useState<ShortcutHandlerProps | undefined>();
  const [isEditing, setIsEditing] = useState(false);

  useExtensionEvent(
    LinkExtension,
    'onShortcut',
    useCallback(
      (props) => {
        if (!isEditing) {
          setIsEditing(true);
        }

        return setLinkShortcut(props);
      },
      [isEditing],
    ),
  );

  return { linkShortcut, isEditing, setIsEditing };
}

function useFloatingLinkState() {
  const chain = useChainedCommands();
  const { isEditing, linkShortcut, setIsEditing } = useLinkShortcut();
  const { to, empty: isSelectionEmpty } = useCurrentSelection();
  const extension = useExtension(LinkExtension);

  const url = (useAttrs().link()?.href as string) ?? '';
  const [href, setHref] = useState<string>(url);

  // A positioner which only shows for links.
  const linkPositioner = useMemo(() => createMarkPositioner({ type: 'link' }), []);

  const onLinkOpen = useCallback(() => {
    window.open(url, extension.options.defaultTarget ?? '_blank');
  }, [extension.options.defaultTarget, url]);

  const onRemoveLink = useCallback(() => {
    chain.removeLink().focus().run();
    setIsEditing(false);
  }, [chain, setIsEditing]);

  useEffect(() => {
    setHref(url);
  }, [url]);

  const handleUpdatelink = useCallback(() => {
    setIsEditing(false);
    const range = linkShortcut ?? undefined;

    if (href === '') {
      chain.removeLink();
    } else {
      chain.updateLink({ href, auto: false }, range).run();
    }

    chain.focus(range?.to ?? to).run();
  }, [setIsEditing, linkShortcut, chain, href, to]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    chain.emptySelection().run();
  }, [chain, setIsEditing]);

  const onEditLink = useCallback(() => {
    if (isSelectionEmpty) {
      chain.selectLink().run();
    }

    setIsEditing(true);
  }, [chain, isSelectionEmpty, setIsEditing]);

  return useMemo(
    () => ({
      href,
      setHref,
      linkShortcut,
      linkPositioner,
      isEditing,
      setIsEditing,
      onEditLink,
      onRemoveLink,
      onLinkOpen,
      handleUpdatelink,
      handleCancelEdit,
    }),
    [
      href,
      linkShortcut,
      linkPositioner,
      isEditing,
      setIsEditing,
      onEditLink,
      onLinkOpen,
      onRemoveLink,
      handleUpdatelink,
      handleCancelEdit,
    ],
  );
}

interface LinkHighlightProps {
  positioner: StringPositioner;
}

const LinkHighlight = ({ positioner }: LinkHighlightProps) => {
  const { ref, x, y, width, height, active } = usePositioner(positioner);
  const { forceUpdatePositioners } = useCommands();

  useEffect(() => {
    forceUpdatePositioners();
  }, [forceUpdatePositioners]);

  if (!active) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cx(
        'link-highlight',
        css`
          background-color: var(--rmr-hue-blue-7);
          opacity: 0.2;
          pointer-events: none;
          position: absolute;
        `,
      )}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      &nbsp;
    </div>
  );
};

interface DelayAutoFocusInput extends HTMLProps<HTMLInputElement> {
  setOpen: (open: boolean) => void;
}

const DelayAutoFocusInput = ({ setOpen, autoFocus, ...rest }: DelayAutoFocusInput) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    },
    [setOpen, inputRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [autoFocus]);

  return <input id='link-url-input' ref={inputRef} {...rest} />;
};

const FloatingLinkToolbar = () => {
  const {
    isEditing,
    setIsEditing,
    linkPositioner,
    onEditLink,
    onLinkOpen,
    onRemoveLink,
    handleUpdatelink,
    href,
    setHref,
    handleCancelEdit,
  } = useFloatingLinkState();
  const active = useActive();
  const activeLink = active.link();
  const { empty: isSelectionEmpty } = useCurrentSelection();

  const handleOnEditLink = useCallback(() => {
    onEditLink();
  }, [onEditLink]);

  const linkMenuButtons = useMemo(() => {
    if (activeLink) {
      return (
        <>
          <CommandButton
            commandName='updateLink'
            onSelect={handleOnEditLink}
            icon='pencilLine'
            enabled
          />
          <CommandButton
            commandName='removeLink'
            onSelect={onRemoveLink}
            icon='linkUnlink'
            enabled
          />
          <CommandButton
            commandName='activateLink'
            onSelect={onLinkOpen}
            icon='externalLinkFill'
            enabled
          />
        </>
      );
    }

    if (!isSelectionEmpty) {
      return (
        <CommandButton commandName='updateLink' onSelect={handleOnEditLink} icon='link' enabled />
      );
    }

    return <></>;
  }, [activeLink, isSelectionEmpty, handleOnEditLink, onRemoveLink, onLinkOpen]);

  return (
    <>
      {!isEditing && <FloatingToolbar>{linkMenuButtons}</FloatingToolbar>}
      {!isEditing && isSelectionEmpty && (
        <FloatingToolbar positioner={linkPositioner}>{linkMenuButtons}</FloatingToolbar>
      )}
      <FloatingWrapper
        enabled={isEditing}
        placement='bottom-start'
        positioner='selection'
        renderOutsideEditor={false}
      >
        <DelayAutoFocusInput
          setOpen={setIsEditing}
          style={{ zIndex: 20 }}
          autoFocus
          placeholder='Enter link...'
          onChange={(event: ChangeEvent<HTMLInputElement>) => setHref(event.target.value)}
          value={href}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            const { code } = event;

            if (code === 'Enter') {
              handleUpdatelink();
            }

            if (code === 'Escape') {
              handleCancelEdit();
            }
          }}
        />
      </FloatingWrapper>
      <PositionerPortal>
        <LinkHighlight positioner='selection' />
      </PositionerPortal>
    </>
  );
};

const EditDialog = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions: () => [new LinkExtension({ autoLink: true })],
    content: `Click this <a href="https://remirror.io" target="_blank">link</a> to edit it`,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state}>
        <EditorComponent />
        <FloatingLinkToolbar />
      </Remirror>
    </ThemeProvider>
  );
};

export default EditDialog;
