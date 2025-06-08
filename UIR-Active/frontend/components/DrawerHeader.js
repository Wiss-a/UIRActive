// components/DrawerHeader.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, StatusBar,Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import logo from '../assets/logo_uir_active.png'; 

const DrawerHeader = ({ title = 'UIRActive' }) => {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#021651" />
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#021651" />
        </TouchableOpacity>
         <Image source={logo} style={styles.logo} resizeMode="contain" />
        
        <Text style={styles.title}>{title}</Text>
        <View style={styles.placeholder} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    // paddingTop: 10,
  },
  menuButton: {
    padding: 5,
  },
  title: {
    color: '#021651',
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
  },
  placeholder: {
    width: 34, // Même largeur que le bouton menu pour centrer le titre
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
});

export default DrawerHeader;