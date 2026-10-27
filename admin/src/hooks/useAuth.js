import { useContext, useEffect, useState } from 'react';
import AuthContext from 'contexts/JWTContext';

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('context must be used inside provider');

  const [user, setUser] = useState(() => {
    const savedData = localStorage.getItem('users');
    const token = localStorage.getItem('token');
    return !savedData || !token ? null : JSON.parse(savedData);
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(user));
  }, [user]);

  return { ...context, user, setUser };
}
