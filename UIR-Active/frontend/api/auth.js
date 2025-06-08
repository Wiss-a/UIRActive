import axios from 'axios';

//const API = "http://10.85.201.23:8082/auth";
const API = "http://192.168.1.108:8082/auth";



export const register = async (data) => {
  return await axios.post(`${API}/register`, data);
};

export const login = async (data) => {
  return await axios.post(`${API}/login`, data);
};
