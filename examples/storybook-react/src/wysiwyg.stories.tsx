import clsx from 'clsx';
import { ComponentProps, ComponentType, forwardRef, ReactElement } from 'react';
import { Box } from 'reakit/Box';
import { Button } from 'reakit/Button';
import { Dialog, DialogStateReturn, useDialogDisclosure, useDialogState } from 'reakit/Dialog';
import {
  unstable_Form as Form,
  unstable_FormInput as FormInput,
  unstable_FormLabel as FormLabel,
  unstable_FormMessage as FormMessage,
  unstable_FormSubmitButton as FormSubmitButton,
  unstable_useFormState as useFormState,
} from 'reakit/Form';
import { Menu, MenuButton, MenuItem, useMenuState } from 'reakit/Menu';
import {
  Toolbar,
  ToolbarItem,
  ToolbarStateReturn,
  useToolbarItem,
  useToolbarState,
} from 'reakit/Toolbar';
import { Tooltip, TooltipReference, useTooltipState } from 'reakit/Tooltip';
import { invariant } from 'remirror';
import { CorePreset, corePreset, WysiwygPreset, wysiwygPreset } from 'remirror/extensions';
import {
  I18nProvider,
  isValidElement,
  Remirror,
  useI18n,
  useRemirror,
  useRemirrorContext,
} from 'remirror/react';

import { Icon } from '@remirror/react-components';

type EditorExtensions = WysiwygPreset | CorePreset;

const InsertImageForm = () => {
  const { commands } = useRemirrorContext<EditorExtensions>();
  const { i18n } = useI18n();

  const form = useFormState({
    values: { source: '', description: '' },
    onValidate: (values) => {
      invariant(values.source, { message: 'Please provide a valid source for the image' });

      return values;
    },
    onSubmit: (values) => {
      commands.insertImage({ src: values.source, alt: values.description });
    },
  });
  return (
    <Form {...form}>
      {/* <FormLabel {...form} name='source'>
        {i18n._(imageDialogSourceLabel)}
      </FormLabel>
      <FormInput {...form} name='source' placeholder='https://unsplash.com/photos/xwdd5p6WqLE' />
      <FormMessage {...form} name='source' />
      <FormLabel {...form} name='description'>
        {i18n._(imageDialogDescriptionLabel)}
      </FormLabel>
      <FormInput
        {...form}
        name='description'
        placeholder={i18n._(imageDialogDescriptionPlaceholder)}
      />
      <FormMessage {...form} name='description' />
      <FormSubmitButton {...form}>Submit</FormSubmitButton> */}
    </Form>
  );
};

const StaticMenuDropdown = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof MenuButton> & ReturnType<typeof useToolbarState>
>((props, ref) => {
  const menu = useMenuState({ placement: 'bottom-end' });
  const { i18n } = useI18n();

  return (
    <>
      <MenuButton {...menu} {...props} ref={ref} aria-label='More items'>
        <Icon name='arrowDownSFill' />
      </MenuButton>
      <Menu {...menu} aria-label='More items'>
        <MenuItem {...menu} as='div'>
          <Icon name='h1' /> {i18n._(h1)}
        </MenuItem>
        <MenuItem {...menu} as='div'>
          <Icon name='h2' /> {i18n._(h2)}
        </MenuItem>
        <MenuItem {...menu} as='div'>
          <Icon name='h3' /> {i18n._(h3)}
        </MenuItem>
      </Menu>
    </>
  );
});

interface BaseMenuItemProps {
  /** Is this item active right now based on the editor state. */
  active?: boolean;

  /** Can the command be used in the editor. */
  enabled: boolean;

  /** The label to show */
  label: string;
}

interface IconMenuItemProps extends BaseMenuItemProps {
  /** The icon to be rendered. */
  icon: ReactElement | ComponentType<{ active: boolean; enabled: boolean }>;
}

interface ToolbarMenuItemProps extends IconMenuItemProps {
  /** The props for the toolbar */
  toolbar: ToolbarStateReturn;
}

interface ToggleToolbarMenuItemProps extends ToolbarMenuItemProps {
  /** Handle toggling the menu item. */
  onToggle: () => void;
}

const ToggleToolbarMenuItem = (props: ToggleToolbarMenuItemProps) => {
  const { active, enabled, onToggle, icon: Icon, label, toolbar } = props;
  const tooltip = useTooltipState();
  const icon = isValidElement(Icon) ? Icon : <Icon active={true} enabled={true} />;

  return (
    <>
      <TooltipReference {...tooltip} as='span'>
        <ToolbarItem
          {...toolbar}
          as={Button}
          aria-label={label}
          disabled={!enabled}
          className={clsx({ active, enabled }, 'toggle-menu-item')}
          onClick={onToggle}
        >
          {icon}
        </ToolbarItem>
      </TooltipReference>
      <Tooltip {...tooltip}>{label}</Tooltip>
    </>
  );
};

interface DialogToolbarMenuItemProps extends ToolbarMenuItemProps {
  /** Children are required for the dialog. */
  children: ReactElement;
}

/** A menu item which opens a dialog to insert text into the editor. */
const DialogToolbarMenuItem = (props: DialogToolbarMenuItemProps) => {
  const { active, enabled, icon: Icon, label, toolbar, children } = props;
  const dialog = useDialogState();
  const tooltip = useTooltipState();
  const icon = isValidElement(Icon) ? Icon : <Icon active={true} enabled={true} />;
  const htmlProps = useToolbarItem(toolbar, useDialogDisclosure(dialog));
  const { i18n } = useI18n();

  return (
    <>
      <TooltipReference {...tooltip} as='span'>
        <Box
          {...htmlProps}
          as={Button}
          aria-label={label}
          disabled={!enabled}
          className={clsx({ active, enabled }, 'dialog-menu-item')}
        >
          {icon}
        </Box>
      </TooltipReference>
      <Tooltip {...tooltip}>{label}</Tooltip>
      <EditorDialog dialog={dialog} label={i18n._(imageDialogLabel)}>
        {children}
      </EditorDialog>
    </>
  );
};

interface EditorDialogProps {
  /** The state provided by the `useDialogState` hook. */
  dialog: DialogStateReturn;

  /** Children are required for the dialog. */
  children: ReactElement;

  /** The label used  for the dialog container. */
  label: string;
}

/**
 * A modal popup for the editor.
 */
const EditorDialog = (props: EditorDialogProps) => {
  const { dialog, children, label } = props;

  return (
    <Dialog {...dialog} aria-label={label}>
      {children}
    </Dialog>
  );
};

/**
 * The Editor Menu
 */
const EditorMenu = () => {
  const { active, commands } = useRemirrorContext<EditorExtensions>({ autoUpdate: true });
  const toolbar = useToolbarState();
  const { i18n } = useI18n();

  return (
    <Toolbar {...toolbar}>
      <ToggleToolbarMenuItem
        toolbar={toolbar}
        onToggle={() => commands.toggleBold()}
        enabled={commands.toggleBold.isEnabled()}
        active={active.bold()}
        icon={<Icon name='bold' />}
        label={i18n._(bold)}
      />
      <ToggleToolbarMenuItem
        toolbar={toolbar}
        onToggle={() => commands.toggleItalic()}
        enabled={commands.toggleItalic.isEnabled()}
        active={active.italic()}
        icon={<Icon name='italic' />}
        label={i18n._(italic)}
      />
      <ToggleToolbarMenuItem
        toolbar={toolbar}
        onToggle={() => commands.toggleUnderline()}
        enabled={commands.toggleUnderline.isEnabled()}
        active={active.underline()}
        icon={<Icon name='underline' />}
        label={i18n._(underline)}
      />
      <ToolbarItem {...toolbar} as={StaticMenuDropdown as any} />
      <DialogToolbarMenuItem
        toolbar={toolbar}
        enabled={commands.insertImage.isEnabled({})}
        icon={<Icon name='imageAddLine' />}
        label={i18n._(image)}
      >
        <InsertImageForm />
      </DialogToolbarMenuItem>
    </Toolbar>
  );
};

const TextBox = () => {
  const { getRootProps } = useRemirrorContext();

  return <Box {...getRootProps()} />;
};

export default { title: 'Wysiwyg Editor' };

const Editor = () => {
  const { manager, onChange, state } = useRemirror({
    extensions: () => [...wysiwygPreset(), ...corePreset()],
  });

  return (
    <I18nProvider locale='en'>
      <Remirror manager={manager} onChange={onChange} state={state}>
        <EditorMenu />
        <TextBox />
      </Remirror>
    </I18nProvider>
  );
};

export const WysiwygImages = (): JSX.Element => {
  return <Editor />;
};
