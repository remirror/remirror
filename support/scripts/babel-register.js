require('@babel/register')({
  rootMode: 'upward-optional',
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx', '.json'],
  cache: true,
});
