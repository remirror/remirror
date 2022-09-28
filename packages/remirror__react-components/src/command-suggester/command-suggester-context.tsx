import { createContext, useContext } from 'react';

export interface CommandInformation {
  commandId: string;
  label: string;
  description?: string;
}

export interface CommandSuggesterContextValues {
  addCommand: (command: CommandInformation) => void
}

export const CommandSuggesterContext = createContext<CommandSuggesterContextValues | undefined>(void 0);

export function useCommandSuggesterContext(): CommandSuggesterContextValues | undefined {
  return useContext(CommandSuggesterContext);
}
