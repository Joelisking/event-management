'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { API_URL } from '@/lib/constants';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user info
      fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signin = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.details?.length
        ? data.details.map((d) => d.msg).join('. ')
        : data.error || 'Failed to sign in';
      throw new Error(message);
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (
    firstName,
    lastName,
    email,
    password,
    role = 'student',
    organizationName = null,
    userCategory = null,
    countryOfResidence = null,
    countryOfOrigin = null
  ) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        role,
        organizationName,
        userCategory,
        countryOfResidence,
        countryOfOrigin,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.details?.length
        ? data.details.map((d) => d.msg).join('. ')
        : data.error || 'Failed to sign up';
      throw new Error(message);
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const signout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signin,
        signup,
        signout,
        loading,
        getToken,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
