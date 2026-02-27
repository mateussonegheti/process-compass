import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const queryClient = new QueryClient();

function detectRouterBasename() {
  // Vite build may be configured for GitHub Pages (e.g. /process-compass/),
  // but the Lovable preview runs at /. If the current pathname does not start
  // with the configured base, React Router would render nothing (white screen).
  const configuredBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const path = window.location.pathname;

  if (!configuredBase || configuredBase === "/") return "";
  return path.startsWith(configuredBase) ? configuredBase : "";
}

// Componente para proteger rotas que exigem autenticação
// Security Note: This provides defense-in-depth for UI access control.
// Primary security is enforced via RLS policies on the database.
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && requireAdmin && user && !isAdmin) {
      toast.error("Acesso negado", {
        description: "Apenas administradores podem acessar esta página.",
      });
    }
  }, [loading, requireAdmin, user, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Block non-admin users from admin routes
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Componente para redirecionar usuários já logados
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute requireAdmin>
          <Admin />
        </ProtectedRoute>
      }
    />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={detectRouterBasename()}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
