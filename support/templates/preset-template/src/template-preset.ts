export interface TemplateOptions {}

export const templatePreset = (_: TemplateOptions = {}) => [];

export type TemplatePreset = ReturnType<typeof templatePreset>;
