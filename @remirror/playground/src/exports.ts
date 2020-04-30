export function isExtensionName(exportName: string) {
  return exportName.endsWith('Extension') && /^[A-Z]/.test(exportName);
}
