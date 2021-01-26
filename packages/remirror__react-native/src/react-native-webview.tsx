import type { DOMRectSize, HTMLDimensions, LinkPressTarget } from '@formidable-webview/webshell';
import makeWebshell, {
  HandleHTMLDimensionsFeature,
  HandleLinkPressFeature,
} from '@formidable-webview/webshell';
import React, { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import WebView, { WebViewProps } from 'react-native-webview';

const Webshell = makeWebshell(
  WebView,
  new HandleLinkPressFeature({ preventDefault: true }),
  new HandleHTMLDimensionsFeature(),
);

export const Remirror = (webViewProps: WebViewProps): JSX.Element => {
  const [size, setSize] = useState<DOMRectSize | null>(null);
  const onLinkPress = useCallback((target: LinkPressTarget) => {
    Linking.canOpenURL(target.uri) && Linking.openURL(target.uri);
  }, []);
  const onHTMLDimensions = useCallback(
    ({ content: { height, width } }: HTMLDimensions) => setSize({ width, height }),
    [],
  );

  return (
    <Webshell
      onDOMLinkPress={onLinkPress}
      onDOMHTMLDimensions={onHTMLDimensions}
      {...webViewProps}
      style={[webViewProps.style, size]}
    />
  );
};
