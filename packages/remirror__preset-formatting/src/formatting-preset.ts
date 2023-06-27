export interface FormattingOptions {}

export const formattingPreset = (_: FormattingOptions = {}): never[] => [];

export type TemplatePreset = ReturnType<typeof formattingPreset>;
