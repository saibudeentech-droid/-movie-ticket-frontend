import { useState } from "react";

import { AuthContext } from "./AuthContextOnly";

export { AuthContext };

function getInitialAuth() {
  try {
    const savedToken = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    if (savedToken && rawUser) {
      const parsed = JSON.parse(rawUser);
      return { token: savedToken, user: parsed, isLoggedIn: true };
    }
  } catch {
    // ignore
  }
  return { token: null, user: null, isLoggedIn: false };
}

export function AuthProvider({ children }) {
  const initial = getInitialAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(initial.isLoggedIn);
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);

  const login = (authToken, userData) => {
    const normalized = { ...userData, role: userData.role?.toLowerCase() };
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(normalized));
    setToken(authToken);
    setUser(normalized);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}


