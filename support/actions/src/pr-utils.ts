import { getParameters } from 'codesandbox/lib/api/define';
import got from 'got';
import { parse } from 'semver';
import { isNumber } from '@remirror/core-helpers';

export function createSandboxUrl(version: string, extension: 'js' | 'tsx' = 'js') {
  const parameters = getParameters({
    files: {
      'public/index.html': {
        content: `\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="theme-color" content="#000000">
  <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
  <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
  <title>React App</title>
</head>
<body>
  <noscript>
  </noscript>
  <div id="root"></div>
</body>
</html>`,
        isBinary: false,
      },
      [`src/index.${extension}`]: {
        content: `import { StrictMode } from "react";
import ReactDOM from "react-dom";

import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);`,
        isBinary: false,
      },
      [`src/App.${extension}`]: {
        content: `import {
  BoldExtension,
  ItalicExtension,
  UnderlineExtension
} from "remirror/extensions";
import { useRemirror, Remirror, ThemeProvider } from "@remirror/react";
import { AllStyledComponent } from "@remirror/styles/emotion";

const extensions = () => [
  new BoldExtension({}),
  new ItalicExtension(),
  new UnderlineExtension()
];

export default function App() {
  const { manager, state } = useRemirror({
    extensions,
    content: "<p><u>Hello</u> there <b>friend</b> and <em>partner</em>.</p>",
    stringHandler: "html"
  });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} />
      </ThemeProvider>
    </AllStyledComponent>
  );
}
`,
        isBinary: false,
      },
      'package.json': {
        content: JSON.stringify({
          name: `remirror-pr-${version}`,
          version,
          description: 'React example starter project',
          keywords: ['react', 'starter'],
          main: `src/index.${extension}`,
          dependencies: {
            '@emotion/react': '11.1.5',
            '@emotion/styled': '11.1.5',
            '@remirror/pm': version,
            '@remirror/react': version,
            '@remirror/styles': version,
            react: '17.0.1',
            'react-dom': '17.0.1',
            'react-scripts': '4.0.0',
            remirror: version,
          },
          devDependencies: {
            typescript: '4.1.5',
          },
          scripts: {
            start: 'react-scripts start',
            build: 'react-scripts build',
            test: 'react-scripts test --env=jsdom',
            eject: 'react-scripts eject',
          },
          browserslist: ['>0.2%', 'not dead', 'not ie <= 11', 'not op_mini all'],
        }),
        isBinary: false,
      },
    },
  });

  return `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`;
}

export async function getBuildNumber(tag: string): Promise<number> {
  const json = await got(`https://data.jsdelivr.com/v1/package/resolve/npm/remirror@${tag}`).json<{
    version: string | null;
  }>();

  const version = json.version;
  const parsed = parse(version);

  if (!parsed) {
    return 1;
  }

  const { prerelease } = parsed;
  const [, value] = prerelease;

  return isNumber(value) ? value + 1 : 1;
}
