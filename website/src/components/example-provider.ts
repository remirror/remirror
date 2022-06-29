import { ContextHook as _, createContextState } from 'create-context-state';
import { ExampleLanguage } from 'docusaurus-plugin-examples/types';

export interface UseExampleReturn {
  language: ExampleLanguage;
  setLanguage: (language: ExampleLanguage) => void;
}

export interface ExampleProviderProps {
  /**
   * @default 'ts'
   */
  defaultLanguage?: ExampleLanguage;
}

/**
 * A provider for the default language the examples should use.
 */
export const [ExampleProvider, useExample] = createContextState<
  UseExampleReturn,
  ExampleProviderProps
>((config) => {
  const { props, previousContext, set } = config;
  const language = previousContext?.language ?? props.defaultLanguage ?? 'ts';

  return { language, setLanguage: (language) => set({ language }) };
});
