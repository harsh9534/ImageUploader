// hooks/useAuth.ts
import { useState, useEffect } from "react";

// Mock function to check token validity
const isTokenValid = () => {
  // Implement your logic here (e.g., decode token and check expiration)
  return true; // Replace with actual validation
};

// Mock function to refresh token
const refreshToken = async () => {
  // Implement your logic here to refresh the token
  // Return new token or null if refresh fails
  const newToken = "newAccessToken"; // Replace with actual token retrieval logic
  localStorage.setItem("accessToken", newToken);
  return newToken;
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (isTokenValid()) {
      setIsAuthenticated(true);
    } else {
      // If token is not valid, attempt to refresh it
      refreshToken().then(() => {
        if (isTokenValid()) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      });
    }
  }, []);

  return { isAuthenticated };
};
