'use client';

import { getMe } from '@/infrastructure/api/auth-api';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

export type AuthContextType = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role_codes: string[];
};

const AuthContext = React.createContext<{
  user: AuthContextType | null;
  changeUser: (user: AuthContextType | null) => void;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthContextType | null>(null);
  const router = useRouter();

  const changeUser = (user: AuthContextType | null) => {
    setUser(user);
  };

  React.useEffect(() => {
    // Simulate fetching user data from an API or local storage
    const fetchUser = async () => {
      const meRes = await getMe();
      if (meRes.status === 401) {
        toast.error('You need to log in to access the dashboard', {
          duration: 5000,
          position: 'top-right',
        });
        router.push('/auth/login');
        return;
      }

      if (!meRes.success || !meRes.data) {
        toast.error('Failed to load user data', {
          duration: 5000,
          position: 'top-right',
        });
        router.push('/auth/login');
        return;
      }

      setUser({ ...meRes.data, email: 'Chua set email', role_codes: ['user', 'admin'] });
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        changeUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
