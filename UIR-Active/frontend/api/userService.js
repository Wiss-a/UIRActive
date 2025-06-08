import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_BASE_URL = 'http://10.85.201.23:8082/api';
// const AUTH_BASE_URL = 'http://10.85.201.23:8082/auth';
const API_BASE_URL = 'http://192.168.1.108:8082/api';
const AUTH_BASE_URL = 'http://192.168.1.108:8082/auth';
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('jwtToken');
    console.log('🔍 Retrieved token from AsyncStorage:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
  } catch (error) {
    console.error('❌ Error retrieving token:', error);
    return null;
  }
};

const getAuthHeaders = async () => {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  
  console.log('📋 Headers being sent:');
  console.log('   Content-Type:', headers['Content-Type']);
  console.log('   Authorization:', headers['Authorization'] ? 'Bearer [TOKEN_PRESENT]' : 'NOT_PRESENT');
  
  return headers;
};

export const userService = {
  // Récupérer utilisateur par email
  getUserByEmail: async (email) => {
    console.log(`🔄 Making request to getUserByEmail for email: ${email}`);
    console.log(`🌐 Request URL: ${API_BASE_URL}/users/profile/${email}`);
    const headers = await getAuthHeaders();
    
    try {
      console.log('📤 About to send request with headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/users/profile/${email}`, {
        method: 'GET',
        headers
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response statusText:', response.statusText);
      
      const responseText = await response.text();
      console.log('📡 Response body:', responseText);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔐 Unauthorized - removing token');
          await AsyncStorage.removeItem('jwtToken');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText} - ${responseText}`);
      }
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error('Réponse JSON invalide');
      }
    } catch (error) {
      console.error('❌ getUserByEmail error:', error);
      if (error.message.includes('Session expirée')) {
        throw error;
      }
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
  },

  // Récupérer utilisateur par ID (garde la méthode existante pour compatibilité)
  getUserById: async (id) => {
    console.log(`🔄 Making request to getUserById for ID: ${id}`);
    console.log(`🌐 Request URL: ${API_BASE_URL}/users/${id}`);
    const headers = await getAuthHeaders();
    
    try {
      console.log('📤 About to send request with headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response statusText:', response.statusText);
      
      const responseText = await response.text();
      console.log('📡 Response body:', responseText);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔐 Unauthorized - removing token');
          await AsyncStorage.removeItem('jwtToken');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText} - ${responseText}`);
      }
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error('Réponse JSON invalide');
      }
    } catch (error) {
      console.error('❌ getUserById error:', error);
      if (error.message.includes('Session expirée')) {
        throw error;
      }
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
  },

  // Mettre à jour utilisateur par email
  updateUserByEmail: async (email, userData) => {
    console.log(`🔄 Making request to updateUserByEmail for email: ${email}`);
    console.log('📦 User data to update:', userData);
    const headers = await getAuthHeaders();
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/${email}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔐 Unauthorized - removing token');
          await AsyncStorage.removeItem('jwtToken');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 409) {
          throw new Error('Cet email est déjà utilisé par un autre utilisateur');
        }
        
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('❌ updateUserByEmail error:', error);
      throw error;
    }
  },

  // Mettre à jour utilisateur par ID (garde la méthode existante pour compatibilité)
  updateUser: async (id, userData) => {
    console.log(`🔄 Making request to updateUser for ID: ${id}`);
    const headers = await getAuthHeaders();
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔐 Unauthorized - removing token');
          await AsyncStorage.removeItem('jwtToken');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 409) {
          throw new Error('Cet email est déjà utilisé par un autre utilisateur');
        }
        
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('❌ updateUser error:', error);
      throw error;
    }
  },

  // Service de connexion (corrigé pour utiliser la bonne URL)
  login: async (email, password) => {
    console.log('🔄 Making login request for email:', email);
    
    try {
      const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Login failed:', errorText);
        throw new Error('Identifiants incorrects');
      }

      const data = await response.json();
      console.log('✅ Login successful, token received:', data.token ? `${data.token.substring(0, 20)}...` : 'No token');
      
      // Stocker le token
      if (data.token) {
        await AsyncStorage.setItem('jwtToken', data.token);
        console.log('💾 Token stored in AsyncStorage');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  // Service d'inscription
  register: async (userData) => {
    console.log('🔄 Making register request');
    
    try {
      const response = await fetch(`${AUTH_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('📡 Register response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Register failed:', errorText);
        throw new Error('Erreur lors de l\'inscription');
      }

      return response.json();
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await AsyncStorage.removeItem('jwtToken');
      await AsyncStorage.removeItem('userEmail');
      console.log('🚪 User logged out, tokens removed');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  },

  // Test method to check if token is working
  testAuth: async () => {
    console.log('🧪 Testing authentication...');
    const headers = await getAuthHeaders();
    
    try {
      const response = await fetch(`${API_BASE_URL}/test/auth`, {
        method: 'GET',
        headers
      });
      
      console.log('🧪 Test auth response status:', response.status);
      return response.status === 200;
    } catch (error) {
      console.error('❌ Test auth error:', error);
      return false;
    }
  }
};