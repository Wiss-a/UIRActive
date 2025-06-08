import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/SignUpStyles';
import { login } from '../api/auth';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth from AuthContext

const SignInForm = ({ navigation }) => {
  const { loginWithToken } = useAuth(); // Get loginWithToken function from context
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    if (field === 'email') {
      if (!value.endsWith('@uir.ac.ma')) {
        setEmailError('Email must end with @uir.ac.ma');
      } else {
        setEmailError(null);
      }
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleLogin = async () => {
    if (emailError) {
      Alert.alert("Error", "Please fix the email format");
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Attempting login for:', formData.email);
      
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      console.log('✅ Login response received:', response);

      const token = response.data?.token || response.token;
      if (token) {
        console.log('🔑 Token received, storing credentials...');
        
        // Store both the token and the user email
        await AsyncStorage.setItem('jwtToken', token);
        await AsyncStorage.setItem('userEmail', formData.email);
        
        console.log('💾 Stored token and email:', {
          email: formData.email,
          tokenPreview: `${token.substring(0, 20)}...`
        });
        
        // Use loginWithToken function from context
        await loginWithToken(token);
        
        console.log('✅ Login successful');
      } else {
        console.error('❌ No token in response:', response);
        Alert.alert("Login failed", "No token received from server");
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      
      let errorMessage = "Check your email or password.";
      
      if (err.response?.status === 401) {
        errorMessage = "Invalid email or password.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.message.includes('Network')) {
        errorMessage = "Network error. Check your connection.";
      }
      
      Alert.alert("Login failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('../assets/logo0.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#021651" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                />
              </View>
              {emailError && <Text style={{ color: 'red' }}>{emailError}</Text>}

              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#021651" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => handleChange('password', text)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#021651"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.button, 
                (!formData.email || !formData.password || loading) && styles.buttonDisabled
              ]}
              disabled={!formData.email || !formData.password || loading}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Need to create an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Sign Up')}>
                <Text style={styles.signInLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInForm;