import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CategoryDetailsScreen from '../screens/CategoryDetailsScreen';
import ModuleDetailsScreen from '../screens/ModuleDetailsScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import AssessmentResultsScreen from '../screens/AssessmentResultsScreen';
import AssessmentReviewScreen from '../screens/AssessmentReviewScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
      />
      <Stack.Screen 
        name="CategoryDetails" 
        component={CategoryDetailsScreen} 
      />
      <Stack.Screen 
        name="ModuleDetails" 
        component={ModuleDetailsScreen} 
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
      />
      <Stack.Screen 
        name="Assessment" 
        component={AssessmentScreen} 
      />
      <Stack.Screen 
        name="AssessmentResults" 
        component={AssessmentResultsScreen} 
      />
      <Stack.Screen 
        name="AssessmentReview" 
        component={AssessmentReviewScreen} 
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
