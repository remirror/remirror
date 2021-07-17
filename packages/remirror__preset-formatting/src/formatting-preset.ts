export interface FormattingOptions {}

export const formattingPreset = (_: FormattingOptions = {}): never[] => {
  return [];
};

export type TemplatePreset = ReturnType<typeof formattingPreset>;
