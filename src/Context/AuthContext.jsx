import { useEffect, useState } from "react";

import { AuthContext } from "./AuthContextOnly";

export { AuthContext };

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const rawUser = localStorage.getItem("user");
      if (savedToken && rawUser) {
        const parsed = JSON.parse(rawUser);
        setToken(savedToken);
        setUser(parsed);
        setIsLoggedIn(true);
      }
    } catch {
      // ignore
    }
  }, []);

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


