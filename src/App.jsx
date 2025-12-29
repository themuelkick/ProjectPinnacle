import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Page Imports
import Dashboard from "./pages/Dashboard";
import PlayerDetail from "./pages/PlayerDetail";
import DrillDetail from "./pages/DrillDetail";
import CreatePlayer from "./pages/CreatePlayer";
import CreateDrill from "./pages/CreateDrill";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Encyclopedia imports
import Encyclopedia from "./pages/Encyclopedia/Encyclopedia";
import ConceptList from "./pages/Encyclopedia/ConceptList";
import ConceptDetail from "./pages/Encyclopedia/ConceptDetail";
import ConceptForm from "./pages/Encyclopedia/ConceptForm";

// Component Imports
import Navbar from "./components/navbar/Navbar";
import TechBackground from "./components/TechBackground/TechBackground";

/**
 * ProtectedRoute: Checks if user is authenticated.
 * Includes a timeout to prevent infinite loading screens.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [forceEntry, setForceEntry] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setForceEntry(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking session, unless we've timed out
  if (loading && !forceEntry) {
    return (
      <div className="bg-black text-white h-screen flex items-center justify-center font-black italic uppercase tracking-widest">
        Initializing Intelligence System...
      </div>
    );
  }

  // UPDATED LOGIC: Redirect to login if there is no user AND
  // we are either done loading or the timeout (forceEntry) hit.
  if (!user && (!loading || forceEntry)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-transparent relative">
        <TechBackground />

        <div className="relative z-10">
          <Routes>
            {/* Public Routes: No Navbar rendered here */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes: Navbar ONLY rendered inside here */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/players/new" element={<CreatePlayer />} />
                    <Route path="/drills/new" element={<CreateDrill />} />
                    <Route path="/players/:id" element={<PlayerDetail />} />
                    <Route path="/encyclopedia" element={<Encyclopedia />}>
                      <Route index element={<ConceptList />} />
                      <Route path="new" element={<ConceptForm />} />
                      <Route path=":conceptId/edit" element={<ConceptForm isEdit />} />
                      <Route path=":conceptId" element={<ConceptDetail />} />
                    </Route>
                    <Route path="/drills/:id" element={<DrillDetail />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;