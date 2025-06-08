// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://192.168.1.108:8082/api', 
  timeout: 10000,
}); 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Setup axios interceptors
  useEffect(() => {
    // Request interceptor to add token to headers
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('jwtToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 Added token to request headers');
          }
        } catch (error) {
          console.error('❌ Error adding token to request:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.log('🔓 Token expired, logging out...');
          await logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const checkToken = useCallback(async () => {
    console.log('🔍 Checking token...');
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      console.log('🔍 Token from storage:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('🔍 User from storage:', storedUser ? 'exists' : 'null');
      
      if (!token) {
        console.log('❌ No token found');
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      // Verify token validity
      try {
        const decodedToken = jwtDecode(token);
        console.log('🔍 Decoded token full:', decodedToken);
        console.log('🔍 Token claims - userId:', decodedToken.userId, 'email:', decodedToken.email, 'sub:', decodedToken.sub);
        
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          console.log('⏰ Token expired');
          await AsyncStorage.multiRemove(['jwtToken', 'user']);
          setIsLoggedIn(false);
          setUser(null);
          return;
        }
        
        // Token is valid
        console.log('✅ Token is valid');
        setIsLoggedIn(true);
        
        // ALWAYS prioritize stored user data over token data
        // because the stored data has the correct numeric ID from login response
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('👤 User loaded from storage (preferred):', userData);
        } else {
          // Extract from token - now properly getting the numeric userId claim
          const userFromToken = {
            id: decodedToken.userId, // This should be the numeric ID from your JWT
            email: decodedToken.email || decodedToken.sub, // Use email claim or fallback to subject
          };
          setUser(userFromToken);
          console.log('👤 User extracted from token:', userFromToken);
          
          // Store this data for future use
          if (userFromToken.id && userFromToken.email) {
            await AsyncStorage.setItem('user', JSON.stringify(userFromToken));
            console.log('💾 User data stored from token extraction');
          }
        }
        
      } catch (decodeError) {
        console.error('❌ Token decode error:', decodeError);
        await AsyncStorage.multiRemove(['jwtToken', 'user']);
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Check token error:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      console.log('🔐 Attempting login for:', email);
      
      // Note: Your endpoint seems to be /auth/login based on the controller, not /students/login
      const response = await axios.post('http://192.168.1.108:8082/auth/login', {
        email,
        password
      });

      console.log('📥 Login response status:', response.status);
      console.log('📥 Login response data:', response.data);
      
      if (response.status === 200) {
        const { token, user: userData, userId, email: userEmail } = response.data;
        
        if (token) {
          // Store JWT token
          await AsyncStorage.setItem('jwtToken', token);
          console.log('💾 JWT token stored');
        }
        
        // Create user object with numeric ID - prioritize the response data over token
        const userObj = {
          id: userData?.id || userId || decodedToken.userId, // Use the numeric ID from login response
          email: userData?.email || userEmail || email,
        };
        
        console.log('🔍 Creating user object:', userObj);
        
        if (userObj.id && userObj.email) {
          // Store user data
          await AsyncStorage.setItem('user', JSON.stringify(userObj));
          setUser(userObj);
          console.log('👤 User data stored with numeric ID:', userObj);
        }
        
        setIsLoggedIn(true);
        return true;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('Network connection failed. Please check your internet connection and server availability.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithToken = async (token) => {
    try {
      console.log('🔐 Login with token:', token ? `${token.substring(0, 20)}...` : 'null');
      await AsyncStorage.setItem('jwtToken', token);
      console.log('💾 Token stored in AsyncStorage');
      await checkToken();
    } catch (error) {
      console.error('❌ Login with token error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔓 Logging out...');
      await AsyncStorage.multiRemove(['jwtToken', 'user']);
      setUser(null);
      setIsLoggedIn(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect triggered');
    checkToken();
  }, [checkToken]);

  console.log('📊 AuthProvider state:', { 
    isLoggedIn, 
    isLoading, 
    user: user ? `ID: ${user.id}, Email: ${user.email}` : 'null'
  });

  const value = {
    user,
    isLoading,
    isLoggedIn,
    login,
    loginWithToken,
    logout,
    checkToken,
    api,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { api };