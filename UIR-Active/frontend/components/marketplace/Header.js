import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import the logo
import logo from '../../assets/logo_uir_active.png'; // Adjust the path if necessary

const Header = () => {
  const navigation = useNavigation();

  const handleSellPress = () => {
    navigation.navigate('CreateListing');
  };

  return (
    <View style={styles.header}>
      <View style={styles.titleSection}>
        {/* Logo and Title side by side */}
        
        <View style={styles.logoContainer}>

          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.titleText}>Sports Market</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.sellButton} onPress={handleSellPress}>
        <Ionicons name="add" size={22} color="#FFF" />
        <Text style={styles.sellButtonText}>List Item</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // paddingTop: 35,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  titleSection: {
    flexDirection: 'column',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#021651',
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  sellButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default Header;