import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login'); // 'login' | 'register'

  // Check active session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me');

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur vérification session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      setUser(null);
      setView('login');
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header user={null} onLogout={() => {}} />
        <div className="loading-spinner">Chargement de la session...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header user={user} onLogout={handleLogout} />
      {user ? (
        <Dashboard user={user} />
      ) : view === 'login' ? (
        <Login
          onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
          onSwitchToRegister={() => setView('register')}
        />
      ) : (
        <Register
          onRegisterSuccess={(registeredUser) => setUser(registeredUser)}
          onSwitchToLogin={() => setView('login')}
        />
      )}
    </div>
  );
}
