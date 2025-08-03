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

        if (accessToken && userId) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        const silentAuthResponse = await axios.post(
          `${baseURL}/api/v1/auth/silent-auth`,
          {},
          {
            withCredentials: true,
            timeout: 5000,
          }
        );

        if (silentAuthResponse.data.accessToken) {
          sessionStorage.setItem(
            "accessToken",
            silentAuthResponse.data.accessToken
          );
          localStorage.setItem("userId", silentAuthResponse.data.user.id);
          setIsAuthenticated(true);
        } else {
          console.log("Silent auth failed - no access token in response");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error details:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });

        setIsAuthenticated(false);
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [baseURL]);

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

  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && window.location.pathname === "/") {
    return <Navigate to="/postboth" replace />;
  }

  return children;
};

export default ProtectedRoute;
