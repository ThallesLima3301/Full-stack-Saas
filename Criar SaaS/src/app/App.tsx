import { useState } from "react";
import { AuthProvider } from "../hooks/useAuth";
import { LandingPage } from "../components/LandingPage";
import { Dashboard } from "../components/Dashboard";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="size-full">
      {!isLoggedIn ? (
        <LandingPage onGetStarted={() => setIsLoggedIn(true)} />
      ) : (
        <Dashboard onLogout={() => setIsLoggedIn(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}