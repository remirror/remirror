module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|react-navigation|react-navigation-redux-helpers|@react-navigation/.*)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
};
