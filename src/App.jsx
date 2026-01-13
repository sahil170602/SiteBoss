import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import SupervisorDashboard from './SupervisorDashboard';
import StoreKeeperDashboard from './StoreKeeperDashboard'; // <--- IMPORT THIS
import { HardHat } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check for saved session
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  // 2. Handle Login
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('nexus_user', JSON.stringify(userData));
  };

  // 3. Handle Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexus_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-nexus-dark flex flex-col items-center justify-center z-50 fixed inset-0">
        <div className="w-24 h-24 bg-nexus-accent rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/20 animate-bounce">
          <HardHat className="w-12 h-12 text-nexus-dark" />
        </div>
        <h1 className="text-white text-3xl font-bold tracking-[0.2em] animate-pulse">NEXUS</h1>
        <p className="text-nexus-muted text-xs mt-2 font-medium tracking-wide">SITE MANAGER</p>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : user.role === 'OWNER' ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : user.role === 'STORE_KEEPER' ? (
        <StoreKeeperDashboard user={user} onLogout={handleLogout} /> // <--- NEW ROUTE
      ) : (
        <SupervisorDashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;