import { createContext } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: false,
  setIsAuthenticated: () => {},
  logout: () => {},
});
