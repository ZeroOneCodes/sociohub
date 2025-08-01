import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Contact from "./components/Contact";
import Terms from "./components/Terms";
import PrivacyPolicy from "./components/PrivacyPolicy";
import OAuthLogin from "./components/OAuthLogin";
import CombinedSocialPost from "./components/CombinedSocialPost";
import ConnectAppsComponent from "./components/ConnectAppsComponent";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route
          path="/logout"
          element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth/platorms"
          element={
            <ProtectedRoute>
              <OAuthLogin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/postboth"
          element={
            <ProtectedRoute>
              <CombinedSocialPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connect/apps"
          element={
            <ProtectedRoute>
              <ConnectAppsComponent />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
