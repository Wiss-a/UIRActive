import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';

// This is the main component that handles both splash screen and auth selection
const WelcomePage = ({navigation}) => {
  // State to track whether splash screen should be shown
  const [showSplash, setShowSplash] = useState(true);
  
  // Animation value for fade effects
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Set a timeout to hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      // Fade out splash screen
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // After animation completes, switch to auth screen
        setShowSplash(false);
      });
    }, 5000);

    // Clean up timer if component unmounts
    return () => clearTimeout(timer);
  }, []);

  // Splash Screen Component
  const SplashScreen = () => (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image 
        source={require('../assets/logo0.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
    </Animated.View>
  );

  // Auth Selection Screen Component
  const AuthSelectionScreen = () => (
    <View style={styles.container}>
              

      <Image 
        source={require('../assets/img1.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>Find & Book</Text>
      <Text style={styles.appName2}>Browse available venues and discover the ideal location for your game.</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Sign In')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.signUpButton]} onPress={() => navigation.navigate('Sign Up')}>
          <Text style={[styles.buttonText, styles.signUpText]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render splash or auth screen based on state
  return showSplash ? <SplashScreen /> : <AuthSelectionScreen />;
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 400,
    height: 400,
    //marginBottom: 0,
    //marginLeft: 30,
  },
  smallLogo: {
    width: 120,
    height: 120,
    marginBottom: 50,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#021651',
  },
  appName2: {
    fontSize: 16,
    fontWeight: 'italic',
    color: '#021651',
    marginBottom:30,
    marginLeft: 20,
  },
  buttonContainer: {
    width: '80%',
  },
  button: {
    backgroundColor: '#021651',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  signUpButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#021651',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpText: {
    color: '#021651',
  },
});

export default WelcomePage;