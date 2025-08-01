import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");

        if (!accessToken || !userId) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verify token with backend
        //await makeAuthenticatedRequest('/api/v1/auth/refre');

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  });

  const makeAuthenticatedRequest = async (endpoint) => {
    let accessToken = sessionStorage.getItem("accessToken");

    try {
      const response = await axios.get(`${baseURL}${endpoint}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response;
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        const refreshResponse = await axios.post(
          `${baseURL}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        sessionStorage.setItem("accessToken", newAccessToken);

        const retryResponse = await axios.get(`${baseURL}${endpoint}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
        });

        return retryResponse;
      }
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
