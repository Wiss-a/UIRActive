// navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import MarketplaceHomeScreen from '../screens/marketplace/MarketplaceHomeScreen';
import ItemDetailScreen from '../screens/marketplace/ItemDetailScreen';
import SavedItemsScreen from '../screens/marketplace/SavedItemsScreen';
import ProfileScreen from '../screens/marketplace/ProfileScreen';
import CreateListingScreen from '../screens/marketplace/CreateListingScreen';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Marketplace Stack Navigator
const MarketplaceStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MarketplaceHome" component={MarketplaceHomeScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Marketplace') {
            iconName = focused ? 'basketball' : 'basketball-outline';
          } else if (route.name === 'Saved') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#002286',
        tabBarInactiveTintColor: '#666',
      })}
    >
      <Tab.Screen name="Marketplace" component={MarketplaceStack} />
      <Tab.Screen name="Saved" component={SavedItemsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Export the MainTabNavigator directly instead of wrapping it in NavigationContainer
const AppNavigator = () => {
  return <MainTabNavigator />;
};

export default AppNavigator;