import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Settings, Heart, Shield, LayoutDashboard, HeartHandshake as Handshake } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  const mainNavItems = [
    { name: 'Accueil', path: '/' },
    { name: 'Contact', path: '/contact' },
  ];
  
  const userDropdownItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profil', path: '/profile', icon: Settings },
  ];
  
  const adminDropdownItems = [
    ...userDropdownItems,
    { name: 'Admin', path: '/admin', icon: Shield },
  ];

  const dropdownItems = profile?.is_admin ? adminDropdownItems : userDropdownItems;

  const NavItem = ({ path, name }) => (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `transition-colors duration-300 font-medium text-lg ${
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`
      }
      onClick={() => setIsOpen(false)}
    >
      {name}
    </NavLink>
  );

  return (
    <nav className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-20">
          <div className="absolute left-0 flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-foreground">WIIBEC</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
            {mainNavItems.map((item) => (
              <NavItem key={item.name} {...item} />
            ))}
          </div>

          <div className="absolute right-0 hidden md:flex items-center space-x-2">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/donate">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Heart className="w-4 h-4 mr-2" />
                    Faire un don
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-primary/50">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {dropdownItems.map((item) => (
                       <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)} className="cursor-pointer">
                         <item.icon className="mr-2 h-4 w-4" />
                         <span>{item.name}</span>
                       </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link to="/donate">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Heart className="w-4 h-4 mr-2" />
                    Faire un don
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="absolute right-0 flex items-center md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {mainNavItems.map((item) => (
                  <NavItem key={item.name} {...item} />
                ))}
                {user && dropdownItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-md text-lg font-medium ${
                        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      }`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                ))}
                <div className="pt-4 mt-4 border-t border-border">
                  {user ? (
                    <div className="space-y-2">
                      <Link to="/donate" className="block" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-primary text-primary-foreground justify-start">Faire un don</Button>
                      </Link>
                      <Button onClick={handleLogout} variant="destructive" className="w-full justify-start">Déconnexion</Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                       <Link to="/login" className="block" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">Connexion</Button>
                      </Link>
                      <Link to="/donate" className="block" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-primary text-primary-foreground">Faire un don</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;