import App from 'next/app';
import { AllStyledComponent } from '@remirror/styles/emotion';

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <AllStyledComponent>
        <Component {...pageProps} />
      </AllStyledComponent>
    );
  }
}
