import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  initialized: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { ...state, user: null, token: null, loading: false };
    case 'UPDATE_USER':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    case 'SET_INITIALIZED': return { ...state, initialized: true };
    default: return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      if (state.token) {
        try {
          const { data } = await authAPI.getMe();
          dispatch({ type: 'UPDATE_USER', payload: data.user });
        } catch {
          dispatch({ type: 'LOGOUT' });
        }
      }
      dispatch({ type: 'SET_INITIALIZED' });
    };
    init();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await authAPI.login({ email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      toast.success(`Welcome back, ${data.user.name}!`);
      return { success: true, user: data.user };
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await authAPI.register(userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      toast.success('Registration successful! Welcome to ShopEase!');
      return { success: true };
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (formData) => {
    try {
      const { data } = await authAPI.updateProfile(formData);
      dispatch({ type: 'UPDATE_USER', payload: data.user });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile, isAdmin: state.user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
