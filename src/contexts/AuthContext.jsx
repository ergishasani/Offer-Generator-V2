// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "../services/firebase";

// Create the context
const AuthContext = createContext();

// Custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sign up with email & password
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Log in with email & password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Log out
  function logout() {
    return signOut(auth);
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children once we know auth state */}
      {!loading && children}
    </AuthContext.Provider>
  );
}
