import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/main/Login";
import Home from "./pages/main/Home";
import Dashboard from "./pages/main/Dashboard";
import Register from "./pages/main/Register";
import Screening from "./pages/main/Screening";
import Result from "./pages/main/Result";
import Profile from "./pages/main/Profile";
import "./App.css";


export default function App() {
  const location = useLocation();
  
  // Pages that should only show footer (no navbar)
  const footerOnlyPages = ['/signIn', '/register', '/screening'];
  const isFooterOnlyPage = footerOnlyPages.includes(location.pathname);

  return (
    <AuthProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isFooterOnlyPage && <Navbar />}
      
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />      
          <Route path="/signIn" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Semi-public routes - accessible to all, but full features require auth */}
          <Route path="/screening" element={<Screening />} />
          <Route path="/result/:predictionId" element={<Result />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
    </AuthProvider>
  );
}