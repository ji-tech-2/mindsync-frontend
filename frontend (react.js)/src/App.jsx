import { Routes, Route } from "react-router-dom";
import Login from "./pages/main/Login";
import Dashboard from "./pages/main/Dashboard";
import Register from "./pages/main/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard isProtected={false} />} />      
      <Route path="/dashboard" element={<Dashboard isProtected={true} />} />
      <Route path="/signIn" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}