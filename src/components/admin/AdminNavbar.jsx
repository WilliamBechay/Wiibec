import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Shield, Home, LogOut, Mail, Users, Settings, FileText, BarChart, FileWarning, Building, Goal, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
    }`;
    
  const mobileNavLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 w-full px-4 py-3 rounded-md text-base font-medium transition-colors ${
      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
    }`;

  const navItems = [
    { to: "/admin/analytics", icon: BarChart, label: "Analyses" },
    { to: "/admin/mailing", icon: Mail, label: "Mailing" },
    { to: "/admin/messages", icon: Users, label: "Messages" },
    { to: "/admin/invoices", icon: FileText, label: "Factures" },
    { to: "/admin/invoice-issues", icon: FileWarning, label: "Problèmes Factures" },
    { to: "/admin/donation-goal", icon: Goal, label: "Objectif Don" },
    { to: "/admin/organization", icon: Building, label: "Organisation" },
    { to: "/admin/settings", icon: Settings, label: "Paramètres" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
           <NavLink to="/admin" className="flex items-center gap-2 font-bold text-lg">
             <Shield className="h-6 w-6 text-primary" />
             <span className="hidden sm:inline-block">Admin</span>
           </NavLink>
        </div>
        
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={navLinkClasses}>
              <item.icon className="h-4 w-4" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="hidden lg:flex items-center justify-end space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Home className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex lg:hidden items-center justify-end ml-auto">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden"
          >
            <div className="border-t bg-background">
              <nav className="grid items-start p-4 gap-2">
                {navItems.map(item => (
                  <NavLink key={item.to} to={item.to} className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                ))}
                <div className="border-t my-2"></div>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>
                  <Home className="h-5 w-5 mr-2" />
                  Site public
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                  <LogOut className="h-5 w-5 mr-2" />
                  Déconnexion
                </Button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default AdminNavbar;