import { rollupBundle, transpileFile } from 'bundler.macro';

test('it can transpile a file', () => {
  expect(transpileFile('../__fixtures__/transpile.fixture.ts')).toMatchSnapshot();
});

test('it can bundle a file', () => {
  expect(rollupBundle('../__fixtures__/bundle.fixture.ts')).toMatchSnapshot();
});

// test('it can bundle an editor', () => {
//   expect(rollupBundle('../__fixtures__/full.fixture.tsx')).toMatchSnapshot();
// });
