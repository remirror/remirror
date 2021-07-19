import { HelperManager } from 'sucrase/dist/HelperManager';
import identifyShadowedGlobals from 'sucrase/dist/identifyShadowedGlobals';
import NameManager from 'sucrase/dist/NameManager';
import { parse } from 'sucrase/dist/parser';
import TokenProcessor from 'sucrase/dist/TokenProcessor';
import RootTransformer from 'sucrase/dist/transformers/RootTransformer';
import getTSImportedNames from 'sucrase/dist/util/getTSImportedNames';

export function transformTypeScriptOnly(code: string): string {
  const { tokens, scopes } = parse(
    code,
    true /* isJSXEnabled */,
    true /* isTypeScriptEnabled */,
    false /* isFlowEnabled */,
  );
  const nameManager = new NameManager(code, tokens);
  const helperManager = new HelperManager(nameManager);
  const tokenProcessor = new TokenProcessor(
    code,
    tokens,
    false /* isFlowEnabled */,
    true,
    helperManager,
  );

  identifyShadowedGlobals(tokenProcessor, scopes, getTSImportedNames(tokenProcessor));
  const sucraseContext = {
    tokenProcessor,
    scopes,
    nameManager,
    importProcessor: null,
    helperManager,
  };

  const transformer = new RootTransformer(sucraseContext, ['typescript'], false, {
    transforms: ['typescript'],
  });
  return transformer.transform();
}
