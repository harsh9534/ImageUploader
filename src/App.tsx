import "./App.css";
import { ThemeProvider } from "next-themes";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";
import Auth from "./Auth/Auth";
import { useAuth } from "./Auth/hooks/auth.ts"; // Custom hook for authentication state

function App() {
  const { isAuthenticated } = useAuth(); // Replace with your authentication logic

  return (
    <Router>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route path="/login" element={<Auth />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
