import React, { Component } from 'react';
import { Button, Text, View } from 'react-native';
import { createAppContainer, createStackNavigator, NavigationScreenProps } from 'react-navigation';
import { PerformanceScreen, UITwitterScreen } from './screens';

class EntryScreen extends Component<NavigationScreenProps<RouteMap>> {
  private navigateTo = (route: RouteMap) => () => this.props.navigation.navigate(route);

  public render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} testID='entry'>
        <Text>Entry Screen</Text>
        <Button title='Performance' onPress={this.navigateTo('Performance')} testID='performance' />
        <Button title='Twitter UI' onPress={this.navigateTo('UITwitter')} testID='twitter_ui' />
      </View>
    );
  }
}

const routeMap = {
  Entry: {
    screen: EntryScreen,
  },
  Performance: {
    screen: PerformanceScreen,
  },
  UITwitter: {
    screen: UITwitterScreen,
  },
};

type RouteMap = keyof typeof routeMap;

const AppNavigator = createStackNavigator(routeMap);

export default createAppContainer(AppNavigator);
