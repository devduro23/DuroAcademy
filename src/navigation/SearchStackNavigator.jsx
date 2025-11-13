import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import SearchScreen from '../screens/SearchScreen';
import ModuleDetailsScreen from '../screens/ModuleDetailsScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import AssessmentResultsScreen from '../screens/AssessmentResultsScreen';
import AssessmentReviewScreen from '../screens/AssessmentReviewScreen';

const Stack = createStackNavigator();

const SearchStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="SearchMain" 
        component={SearchScreen} 
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
    </Stack.Navigator>
  );
};

export default SearchStackNavigator;
