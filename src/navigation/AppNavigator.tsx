import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RecordScreen } from '../screens/RecordScreen';
import { RecordingsListScreen } from '../screens/RecordingsListScreen';
import { PlaybackScreen } from '../screens/PlaybackScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NavigationParams } from '../types';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<NavigationParams>();

const RecordingsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="RecordingsList"
      component={RecordingsListScreen}
      options={{ title: 'My Recordings' }}
    />
    <Stack.Screen
      name="Playback"
      component={PlaybackScreen}
      options={{ title: 'Playback' }}
    />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = 'microphone';
          } else if (route.name === 'Recordings') {
            iconName = 'folder-music';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Home"
        component={RecordScreen}
        options={{ title: 'Record' }}
      />
      <Tab.Screen
        name="Recordings"
        component={RecordingsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};
