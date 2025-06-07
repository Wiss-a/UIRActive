import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email et mot de passe requis.');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    console.log("Tentative de connexion avec :", email, password);
  
    try {
      const response = await fetch('http://localhost:8082/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // CRITICAL: This enables session cookies
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log("Réponse du serveur :", data);
  
      if (response.ok) {
        // Store admin data in localStorage for UI purposes
        localStorage.setItem('admin', JSON.stringify(data.admin));
        onLogin();
      } else {
        setError(data.message || 'Email ou mot de passe incorrect.');
      }
    } catch (error) {
      console.error("Erreur lors de la connexion au serveur :", error);
      setError('Erreur lors de la connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: `url('/images/uir.jpg')` }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 bg-opacity-90">
        <div className="flex justify-center mb-2">
          <img 
            src="/images/logo2.png" 
            alt="UIR Logo" 
            className="h-35 w-auto"  
          />
        </div>

        <h2 className="text-2xl font-semibold text-[#4172E1] mb-3 text-center">Admin Login</h2>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#4172E1]"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#4172E1]"
        />
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full p-2 bg-[#4172E1] text-white rounded hover:bg-[#135F8C] transition flex justify-center items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion...
            </>
          ) : (
            'Login'
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;