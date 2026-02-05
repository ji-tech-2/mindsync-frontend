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


// Inner App component that can use AuthContext
function AppContent() {
  const location = useLocation();
  
  // Pages that should only show footer (no navbar)
  const footerOnlyPages = ['/signIn', '/register', '/screening'];
  const isFooterOnlyPage = footerOnlyPages.includes(location.pathname);

  return (
    <>
      
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        {!isFooterOnlyPage && <Navbar />}
        
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />      
            <Route path="/signIn" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes - require authentication */}
            <Route  
              element={
                <ProtectedRoute />
              } 
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Semi-public routes - accessible to all, but full features require auth */}
            <Route path="/screening" element={<Screening />} />
            <Route path="/result/:predictionId" element={<Result />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
