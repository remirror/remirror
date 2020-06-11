export function isExtensionName(exportName: string) {
  return exportName.endsWith('Extension') && /^[A-Z]/.test(exportName);
}

export function isPresetName(exportName: string) {
  return exportName.endsWith('Preset') && /^[A-Z]/.test(exportName);
}
