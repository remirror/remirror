import { css } from '@emotion/css';
import type { ChangeEvent, HTMLProps, KeyboardEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createMarkPositioner,
  LinkExtension,
  ShortcutHandlerProps,
  TextHighlightExtension,
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
  useCommands,
  useCurrentSelection,
  useExtension,
  useExtensionEvent,
  useRemirror,
  useSelectedText,
} from '@remirror/react';
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
  const commands = useCommands();
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
    chain.removeTextHighlight().emptySelection().run();
  }, [chain, setIsEditing]);

  const onEditLink = useCallback(() => {
    if (isSelectionEmpty) {
      chain.selectLink().run();
    }

    commands.setTextHighlight('red');

    setIsEditing(true);
  }, [chain, commands, isSelectionEmpty, setIsEditing]);

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

interface DelayAutoFocusInput extends HTMLProps<HTMLInputElement> {
  handleSubmit: () => void;
  handleCancel: () => void;
}

const DelayAutoFocusInput = ({
  handleSubmit,
  handleCancel,
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
          editingHref={editingHref}
          setEditingHref={setEditingHref}
          editingText={editingText}
          setEditingText={setEditingText}
          handleUpdatelink={handleUpdatelink}
          handleCancelEdit={handleCancelEdit}
        />
      </FloatingWrapper>
    </>
  );
};

interface EditLinkDialogProps {
  editingHref: string;
  setEditingHref: (href: string) => void;
  editingText: string;
  setEditingText: (text: string) => void;
  handleUpdatelink: () => void;
  handleCancelEdit: () => void;
}

const EditLinkDialog = ({
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
        handleCancelEdit();
      }
    },
    [handleCancelEdit, wrapperRef],
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
        autoFocus
        placeholder='Enter link...'
        onChange={(event: ChangeEvent<HTMLInputElement>) => setEditingHref(event.target.value)}
        value={editingHref}
        handleSubmit={handleUpdatelink}
        handleCancel={handleCancelEdit}
      />
      <DelayAutoFocusInput
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
    extensions: () => [new LinkExtension({ autoLink: true }), new TextHighlightExtension()],
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
