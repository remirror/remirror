export interface FormattingOptions {}

export const formattingPreset = (_: FormattingOptions = {}) => {
  return [];
};

export type TemplatePreset = ReturnType<typeof formattingPreset>;
