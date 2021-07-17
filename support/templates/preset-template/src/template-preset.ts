export interface TemplateOptions {}

export const templatePreset = (_: TemplateOptions = {}) => {
  return [];
};

export type TemplatePreset = ReturnType<typeof templatePreset>;
