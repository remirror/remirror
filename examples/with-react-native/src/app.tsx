import { rollupBundle } from 'bundler.macro';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { NativeRemirror, useNativeRemirror } from '@remirror/react-native';

import WebViewEditor, { extensions } from './webview/webview-editor';

const bundle = rollupBundle('./webview/webview-editor.tsx');

const Editor = () => {
  const { manager, state } = useNativeRemirror({ extensions });

  return (
    <NativeRemirror
      manager={manager}
      initialState={state}
      WebViewEditor={WebViewEditor}
      bundle={bundle}
    >
      <Text>Inside the editor context!</Text>
    </NativeRemirror>
  );
};

const App = () => {
  return (
    <>
      <StatusBar barStyle='dark-content' />
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior='automatic' style={styles.scrollView}>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Editor</Text>
              <Text style={styles.sectionDescription}>This is the editor eventually!</Text>
              <Editor />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
});

export default App;
