import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.DEV 
        ? 'http://localhost:3000/api/auth/google'
        : '/api/auth/google';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      onLoginSuccess(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Stock Dashboard</h1>
            <p>Sign in to view your stock data</p>
          </div>

          <div className="login-content">
            {error && <div className="error-message">{error}</div>}

            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="100"
              />
            </div>

            {loading && <p className="loading-text">Authenticating...</p>}

            <div className="login-footer">
              <p>Secure login powered by Google</p>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};
