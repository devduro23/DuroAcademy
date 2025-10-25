import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CategoryDetailsScreen from '../screens/CategoryDetailsScreen';
import ModuleDetailsScreen from '../screens/ModuleDetailsScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';

const Stack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CategoryDetails" component={CategoryDetailsScreen} />
      <Stack.Screen name="ModuleDetails" component={ModuleDetailsScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;