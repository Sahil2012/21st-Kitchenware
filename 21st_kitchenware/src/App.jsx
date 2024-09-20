import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import TopBar from "./components/TopBar";
import LogIn from "./pages/LogIn";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Products from "./pages/Products";
import Companies from "./pages/Companies";
import Customers from "./pages/Customers";

function App({ isDarkMode, setIsDarkMode }) {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col h-screen w-screen">
          <TopBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          <div className="flex-1 overflow-auto ">
            <Routes>
              <Route path="/" element={<LogIn />} />
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/companies"
                element={
                  <ProtectedRoute>
                    <Companies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dealers"
                element={
                  <ProtectedRoute>
                    <Customers />
                  </ProtectedRoute>
                }
              />
              {/* Redirect to dashboard or login if no path is matched */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
