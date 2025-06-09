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
  useSelectedText,
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
  const text = useSelectedText() ?? '';
  const [editingText, setEditingText] = useState<string>(text);
  const href = (useAttrs().link()?.href as string) ?? '';
  const [editingHref, setEditingHref] = useState<string>(href);
  const extension = useExtension(LinkExtension);

  // A positioner which only shows for links.
  const linkPositioner = useMemo(() => createMarkPositioner({ type: 'link' }), []);

  const onLinkOpen = useCallback(() => {
    window.open(href, extension.options.defaultTarget ?? '_blank');
  }, [extension.options.defaultTarget, href]);

  const onRemoveLink = useCallback(() => {
    chain.removeLink().focus().run();
    setIsEditing(false);
  }, [chain, setIsEditing]);

  useEffect(() => {
    setEditingHref(href);
    setEditingText(text);
  }, [href, text]);

  const handleUpdatelink = useCallback(() => {
    setIsEditing(false);
    const range = linkShortcut ?? undefined;

    if (editingHref === '') {
      chain.removeLink();
    } else {
      chain
        .replaceText({
          content: editingText,
          range,
        })
        .updateLink({ href: editingHref, auto: false }, range)
        .run();
    }

    chain.focus(range?.to ?? to).run();
  }, [setIsEditing, linkShortcut, chain, editingHref, editingText, to]);

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
      editingText,
      setEditingText,
      editingHref,
      setEditingHref,
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
      editingText,
      setEditingText,
      editingHref,
      setEditingHref,
      linkShortcut,
      linkPositioner,
      isEditing,
      setIsEditing,
      onEditLink,
      onRemoveLink,
      onLinkOpen,
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
  handleSubmit: () => void;
  handleCancel: () => void;
}

const DelayAutoFocusInput = ({
  handleSubmit,
  handleCancel,
  setOpen,
  autoFocus,
  ...rest
}: DelayAutoFocusInput) => {
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <input
      ref={inputRef}
      {...rest}
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        const { code } = event;

        if (code === 'Enter') {
          handleSubmit();
        }

        if (code === 'Escape') {
          handleCancel();
        }
      }}
    />
  );
};

const FloatingLinkToolbar = () => {
  const {
    editingText,
    setEditingText,
    isEditing,
    setIsEditing,
    linkPositioner,
    onEditLink,
    onLinkOpen,
    onRemoveLink,
    handleUpdatelink,
    editingHref,
    setEditingHref,
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
        <EditLinkDialog
          setOpen={setIsEditing}
          editingHref={editingHref}
          setEditingHref={setEditingHref}
          editingText={editingText}
          setEditingText={setEditingText}
          handleUpdatelink={handleUpdatelink}
          handleCancelEdit={handleCancelEdit}
        />
      </FloatingWrapper>
      <PositionerPortal>
        <LinkHighlight positioner='selection' />
      </PositionerPortal>
    </>
  );
};

interface EditLinkDialogProps {
  setOpen: (open: boolean) => void;
  editingHref: string;
  setEditingHref: (href: string) => void;
  editingText: string;
  setEditingText: (text: string) => void;
  handleUpdatelink: () => void;
  handleCancelEdit: () => void;
}

const EditLinkDialog = ({
  setOpen,
  editingHref,
  setEditingHref,
  editingText,
  setEditingText,
  handleUpdatelink,
  handleCancelEdit,
}: EditLinkDialogProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    },
    [setOpen, wrapperRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div
      ref={wrapperRef}
      className={cx(
        'edit-link-dialog',
        css`
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px;
          background-color: var(--rmr-hue-gray-1);
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          border: 1px solid var(--rmr-hue-gray-7);
        `,
      )}
    >
      <DelayAutoFocusInput
        setOpen={setOpen}
        autoFocus
        placeholder='Enter link...'
        onChange={(event: ChangeEvent<HTMLInputElement>) => setEditingHref(event.target.value)}
        value={editingHref}
        handleSubmit={handleUpdatelink}
        handleCancel={handleCancelEdit}
      />
      <DelayAutoFocusInput
        setOpen={setOpen}
        autoFocus={false}
        placeholder='Enter text...'
        onChange={(event: ChangeEvent<HTMLInputElement>) => setEditingText(event.target.value)}
        value={editingText}
        handleSubmit={handleUpdatelink}
        handleCancel={handleCancelEdit}
      />
    </div>
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
