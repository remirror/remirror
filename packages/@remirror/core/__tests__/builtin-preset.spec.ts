import { AnyExtension, AnyExtensionConstructor, builtinPreset, KeymapExtension } from 'remirror';

function isOfType<Type extends AnyExtensionConstructor>(Constructor: Type) {
  return (extension: AnyExtension): extension is InstanceType<Type> => {
    return extension.isOfType(Constructor);
  };
}

test('it uses the available options', () => {
  const extensions = builtinPreset({ excludeBaseKeymap: true });

  expect(extensions.find(isOfType(KeymapExtension))?.options.excludeBaseKeymap).toBeTrue();
});
