// API Configuration
export const API_CONFIG = {
    // Change this to your Spring Boot backend URL
    //BASE_URL: 'http://10.85.201.23:8082',
    BASE_URL: 'http://192.168.1.108:8082',

    ENDPOINTS: {
        API: '/api',
        AUTH: '/auth'
    },
    TIMEOUT: 10000, // 10 seconds
};

export const getApiUrl = (endpoint = '') => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.API}${endpoint}`;
export const getAuthUrl = (endpoint = '') => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}${endpoint}`; 