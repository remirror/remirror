import React, { Component, createRef } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { WebViewMessageEvent, WebViewProgressEvent } from 'react-native-webview/lib/WebViewTypes';
import { html } from '../resources/file';

const MAX = 1000;

interface State {
  num: number;
  started: Date;
  duration: number;
  message: string;
}
// Example https://gist.github.com/blankg/d5537a458b55b9d15cb4fd78258ad840
export class PerformanceScreen extends Component<{}, State> {
  public state = {
    num: 0,
    started: new Date(),
    duration: 0,
    message: '',
  };

  private webView = createRef<WebView>();

  private readonly onPress = () => {
    const { duration } = this.state;
    if (duration > 0 && duration < MAX) {
      return;
    }
    this.setState({ num: 0, started: new Date() }, () => {
      console.log('about to post a message');
      this.sendDataToWebView(this.state.num);
      console.log('posted message');
    });
  };

  /**
   * Send data to the webview
   */
  private sendDataToWebView(data: unknown) {
    const { current } = this.webView;
    if (!current) {
      return;
    }
    current.injectJavaScript(`callTestMessageHandler(${JSON.stringify(data)})`);
  }

  private readonly onMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;

    // This causes the app to crash when not in debug
    // console.log('native', event);

    const num = parseInt(JSON.parse(data).message, 10);
    if (isNaN(num) || !Number.isFinite(num)) {
      console.error('something went wrong with the number', num);
      return;
    }
    if (num >= MAX) {
      this.sendDataToWebView('STOP');
      return;
    }
    this.setState({ num, duration: Date.now() - this.state.started.getTime(), message: '' }, () =>
      this.sendDataToWebView(String(this.state.num + 1)),
    );
  };

  /**
   * Notifies when loading progresses
   */
  private readonly onLoadProgress = (event: WebViewProgressEvent) => console.log(event.nativeEvent.progress);

  public render() {
    return (
      <SafeAreaView style={styles.container} testID='performance_screen'>
        <ScrollView>
          <Text style={styles.welcome}>Welcome to React Native!</Text>
          <Button title='Start' onPress={this.onPress} testID='start_performance' />
          <WebView
            ref={this.webView}
            source={{ html }}
            style={{ marginTop: 20, width: 300, height: 100 }}
            onLoadProgress={this.onLoadProgress}
            onMessage={this.onMessage}
          />
          <Text style={styles.welcome}>Message: {this.state.message}</Text>
          <Text style={styles.welcome}>Number: {this.state.num}</Text>
          <Text style={styles.welcome}>Started: {this.state.started.toString()}</Text>
          <Text style={styles.welcome}>Duration: {this.state.duration} ms</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
