import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    toast({
      title: "Accès non autorisé",
      description: "Vous n'avez pas les droits pour accéder à cette page.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;