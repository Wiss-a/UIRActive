import React, { useState } from 'react';
import {  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/SignUpStyles';
import axios from 'axios';


const SignUpForm = ({navigation}) => {

  const [formData, setFormData] = useState({
    firstname: '',
    lastname:'',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState(null);


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
  

// const API = "http://10.85.201.23:8082/auth";
const API = "http://192.168.1.108:8082/auth";



const handleSignUp = async () => {
  try {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (emailError) {
      alert(emailError);
      return;
    }

    const response = await axios.post(`${API}/register`, {
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      password: formData.password
    });
    

    if (response.status === 200) {
      alert("Registration successful!");
      navigation.navigate('Sign In');
     

    } else {
      alert("Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);
    alert(error.response?.data?.message || "Registration failed");
  }
};


  

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* <ImageBackground
        source={require('../assets/logo.jpg')} // Replace with your image
        style={styles.topBackground}
        imageStyle={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
       >
        <Text style={styles.title}>Welcome to UIRActive</Text>
       </ImageBackground> */}
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
              <Image 
                source={require('../assets/logo0.png')} // adjust the path to your image
                style={styles.logoImage}
                resizeMode="contain" // or "cover", "stretch", etc.
              />
              </View>
            </View>
           
            {/* <Text style={styles.heading}>Create Account</Text> */}
            {/* <Text style={styles.subheading}>Sign up to get started!</Text> */}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#021651" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="#A0A0A0"
                  value={formData.firstname}
                  onChangeText={(text) => handleChange('firstname', text)}
                />
              </View>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#021651" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor="#A0A0A0"
                  value={formData.lastname}
                  onChangeText={(text) => handleChange('lastname', text)}
                />
              </View>


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
            
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#021651" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleChange('confirmPassword', text)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#021651"
                  />
                </TouchableOpacity>
              </View>
            </View>

          
            <TouchableOpacity
              style={[styles.button, (!formData.email || !formData.password || !formData.firstname || !formData.lastname ) && styles.buttonDisabled]}
              disabled={!formData.email || !formData.password || !formData.firstname || !formData.lastname}
              onPress={handleSignUp}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>


            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Sign In')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


export default SignUpForm;