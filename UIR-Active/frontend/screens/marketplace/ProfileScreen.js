// screens/marketplace/ProfileScreen.js
import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { Header } from '../../components/marketplace/HomePage';

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        location={null}
        onLocationPress={null}
        onSellPress={null}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.message}>Your listings and account information will appear here</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#002286',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProfileScreen;