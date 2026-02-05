/**
 * useAuth - Custom hook to access AuthContext
 *
 * Provides a convenient way to access authentication state and methods.
 * Includes built-in error checking to ensure it's used within an AuthProvider.
 */

import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
