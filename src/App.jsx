import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/main/Login";
import Dashboard from "./pages/main/Dashboard";
import Register from "./pages/main/Register";
import Screening from "./pages/main/Screening";
import Result from "./pages/main/Result";
import Profile from "./pages/main/Profile";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Dashboard isProtected={false} />} />      
        <Route path="/signIn" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard isProtected={true} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile isProtected={true} />
            </ProtectedRoute>
          } 
        />

        {/* Semi-public routes - accessible to all, but full features require auth */}
        <Route path="/screening" element={<Screening />} />
        <Route path="/result/:predictionId" element={<Result />} />
      </Routes>
    </AuthProvider>
  );
}