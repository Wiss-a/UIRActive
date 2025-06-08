// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; 

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkToken = useCallback(async () => {
    console.log('🔍 Checking token...');
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      console.log('🔍 Token from storage:', token ? `${token.substring(0, 20)}...` : 'null');
      
      if (!token) {
        console.log('❌ No token found');
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      // Vérifier si le token est expiré
      try {
        const decodedToken = jwtDecode(token);
        console.log('🔍 Full decoded token:', decodedToken);
        console.log('🔍 Token keys:', Object.keys(decodedToken));
        
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expiré
          console.log('⏰ Token expired');
          await AsyncStorage.removeItem('jwtToken');
          setIsLoggedIn(false);
          setUser(null);
          return;
        }
        
        // Extract user information more carefully
        // Common JWT fields for user ID: id, userId, user_id, sub (if numeric)
        let userId = null;
        let userEmail = null;
        
        // Try to find numeric user ID
        if (decodedToken.id) {
          userId = decodedToken.idU;
        } else if (decodedToken.userId) {
          userId = decodedToken.userId;
        } else if (decodedToken.user_id) {
          userId = decodedToken.user_id;
        } else if (decodedToken.sub && !decodedToken.sub.includes('@')) {
          // Only use sub as ID if it's not an email
          userId = decodedToken.sub;
        }
        
        // Try to find email
        if (decodedToken.email) {
          userEmail = decodedToken.email;
        } else if (decodedToken.sub && decodedToken.sub.includes('@')) {
          // Use sub as email if it contains @
          userEmail = decodedToken.sub;
        }
        
        console.log('🔍 Extracted userId:', userId);
        console.log('🔍 Extracted userEmail:', userEmail);
        
        // Token valide
        console.log('✅ Token is valid');
        setIsLoggedIn(true);
        setUser({
          id: userId,
          email: userEmail,
         
        });
        
        console.log('👤 User set:', {
          id: userId,
          email: userEmail,
        });
        
      } catch (decodeError) {
        console.error('❌ Token decode error:', decodeError);
        await AsyncStorage.removeItem('jwtToken');
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Check token error:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (token) => {
    console.log('🔐 Login called with token:', token ? `${token.substring(0, 20)}...` : 'null');
    try {
      await AsyncStorage.setItem('jwtToken', token);
      console.log('💾 Token stored in AsyncStorage');
      await checkToken(); // Re-vérifier après la connexion
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🔓 Logout called');
    try {
      await AsyncStorage.removeItem('jwtToken');
      console.log('🗑️ Token removed from AsyncStorage');
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 useAuth useEffect triggered');
    checkToken();
  }, [checkToken]);

  console.log('📊 useAuth state:', { isLoggedIn, loading, userId: user?.id, userEmail: user?.email });

  return {
    isLoggedIn,
    loading,
    user,
    login,
    logout,
    checkToken
  };
};