import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

import SignUpForm from './screens/SignUpForm';
import SignInForm from './screens/SignInForm';
import WelcomePage from './screens/WelcomePage';
import ProfilePage from './screens/ProfilePage';
import MainPage from './screens/MainPage';
import SportVenuesScreen from './screens/SportVenuesScreen';
import MarketplaceHomeScreen from './screens/marketplace/MarketplaceHomeScreen';
import ItemDetailScreen from './screens/marketplace/ItemDetailScreen';
import SavedItemsScreen from './screens/marketplace/SavedItemsScreen';
import CreateListingScreen from './screens/marketplace/CreateListingScreen';
import VenueDetailsScreen from './screens/VenueDetailsScreen';
import ReservationScreen from './screens/ReservationScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import MatchupsScreen from './screens/MatchupsScreen';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LostItemsScreen from './screens/LostItemsScreen';
import MatchupDetailsScreen from './screens/MatchupDetailsScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="WelcomePage" component={WelcomePage} />
    <Stack.Screen name="Sign Up" component={SignUpForm} />
    <Stack.Screen name="Sign In" component={SignInForm} />
  </Stack.Navigator>
);

const MarketplaceStack = () => (
  <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MarketplaceHome" component={MarketplaceHomeScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
        <Stack.Screen name="CreateListing" component={CreateListingScreen} />
        <Stack.Screen name="Saved" component={SavedItemsScreen} />

      </Stack.Navigator>
    </SafeAreaView>
  </SafeAreaProvider>
);

function MatchupsStack() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Navigator>
          <Stack.Screen
            name="MatchupsList"
            component={MatchupsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
          name="MatchupDetails" 
          component={MatchupDetailsScreen}
          options={{ headerShown: false }}
        />
        </Stack.Navigator>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function SportVenuesStack() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Navigator>
          <Stack.Screen
            name="SportVenuesList"
            component={SportVenuesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VenueDetails"
            component={VenueDetailsScreen}
            options={{ title: 'Détails du lieu' }}
          />
          <Stack.Screen
            name="Reservation"
            component={ReservationScreen}
            options={{ title: 'Nouvelle réservation' }}
          />
          
        </Stack.Navigator>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const BottomTabs = () => (
  <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'MainPage') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Marketplace') {
              iconName = focused ? 'basketball' : 'basketball-outline';
            } else if (route.name === 'SportVenues') {
              iconName = focused ? 'location' : 'location-outline';
            } else if (route.name === 'Matchups') {
              iconName = focused ? 'people' : 'people-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="MainPage" component={MainPage} options={{ title: 'Accueil' }} />
        <Tab.Screen name="Marketplace" component={MarketplaceStack} options={{ title: 'Marketplace' }} />
        <Tab.Screen name="SportVenues" component={SportVenuesStack} />
        <Tab.Screen name="Matchups" component={MatchupsStack} />
      </Tab.Navigator>
    </SafeAreaView>
  </SafeAreaProvider>
);

const CustomDrawerContent = ({ navigation }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <DrawerContentScrollView>
      <DrawerItem
        label="Home"
        onPress={() => navigation.navigate('MainPage')}
        icon={({ color, size }) => <Ionicons name="home" color={color} size={20} />}
        labelStyle={styles.drawerLabel}
        style={styles.drawerItem}
      />
      <View style={styles.separator} />
      <DrawerItem
        label="Profile"
        onPress={() => navigation.navigate('ProfilePage')}
        icon={({ color, size }) => <Ionicons name="person" color={color} size={20} />}
        labelStyle={styles.drawerLabel}
        style={styles.drawerItem}
      />
      <View style={styles.separator} />
      <DrawerItem
        label="Lost Items"
        onPress={() => navigation.navigate('LostItems')}
        icon={({ color, size }) => <Ionicons name="help-circle" color={color} size={20} />}
        labelStyle={styles.drawerLabel}
        style={styles.drawerItem}
      />
      <View style={styles.separator} />
      <DrawerItem
        label="Saved"
        onPress={() => navigation.navigate('Saved')}
        icon={({ color, size }) => <Ionicons name="bookmark" color={color} size={20} />}
        labelStyle={styles.drawerLabel}
        style={styles.drawerItem}
      />
      <View style={styles.separator} />
      <DrawerItem
        label="Logout"
        onPress={handleLogout}
        icon={({ color, size }) => <Ionicons name="log-out" color={color} size={20} />}
        labelStyle={styles.drawerLabel}
        style={styles.drawerItem}
      />
    </DrawerContentScrollView>
  );
};

const AppDrawer = () => (
  <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
      <Drawer.Navigator
        initialRouteName="MainPage"
        screenOptions={{ headerShown: false }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name="MainPage" component={BottomTabs} options={{ title: 'UIRActive' }} />
        <Drawer.Screen name="ProfilePage" component={ProfilePage} options={{ title: 'Profile' }} />
        <Drawer.Screen name="LostItems" component={LostItemsScreen} options={{ title: 'Lost Items' }} />

      </Drawer.Navigator>
    </SafeAreaView>
  </SafeAreaProvider>
);

const AppContent = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021651',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerItem: {
    marginVertical: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  drawerLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
    marginVertical: 2,
  },
});

export default App;