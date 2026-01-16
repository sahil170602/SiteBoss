import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Dashboard from './Dashboard';
import Login from './Login';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Restore session on refresh
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        setUser({
          id: data.user.id,          // ✅ UUID
          email: data.user.email,
          role: 'OWNER',
          name: data.user.user_metadata?.name || 'Owner'
        });
      }

      setLoading(false);
    };

    getUser();
  }, []);

  // 🔹 Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  // ✅ FIX #1: PASS onLoginSuccess
  if (!user) {
    return (
      <Login
        onLoginSuccess={(authUser) => {
          setUser(authUser);
        }}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
    />
  );
}
