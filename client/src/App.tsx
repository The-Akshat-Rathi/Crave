import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import RestaurantPage from "@/pages/RestaurantPage";
import ProfilePage from "@/pages/ProfilePage";
import RestaurantDashboard from "@/pages/RestaurantDashboard";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";

function App() {
  const { handleRedirectResult } = useAuth();

  useEffect(() => {
    // Handle potential redirect from Firebase auth
    const checkRedirect = async () => {
      try {
        await handleRedirectResult();
      } catch (error) {
        console.error("Error handling redirect:", error);
      }
    };
    checkRedirect();
  }, [handleRedirectResult]);

  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/restaurant/:id" component={RestaurantPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/dashboard" component={RestaurantDashboard} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
