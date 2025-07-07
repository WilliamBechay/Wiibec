import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Settings, Heart, Shield, LayoutDashboard, UserPlus, Info, HeartHandshake as Handshake } from 'lucide-react';
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
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = ({ onMenuToggle, onAnimationComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  useEffect(() => {
    if (onMenuToggle) {
      onMenuToggle(isOpen);
    }
  }, [isOpen, onMenuToggle]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };
  
  const mainNavItems = [
    { name: t('navbar.home'), path: '/' },
    { name: t('navbar.about'), path: '/about' },
    { name: t('navbar.partners'), path: '/partners' },
    { name: t('navbar.contact'), path: '/contact' },
  ];
  
  const userDropdownItems = [
    { name: t('navbar.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('navbar.profile'), path: '/profile', icon: Settings },
  ];
  
  const adminDropdownItems = [
    ...userDropdownItems,
    { name: t('navbar.adminPanel'), path: '/admin', icon: Shield },
  ];

  const dropdownItems = profile?.is_admin ? adminDropdownItems : userDropdownItems;

  const DesktopNavItem = ({ path, name }) => (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `transition-colors duration-300 font-medium text-lg ${
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`
      }
    >
      {name}
    </NavLink>
  );

  const mobileMenuVariants = {
    closed: { opacity: 0, x: "-100%" },
    open: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 30 } },
    exit: { opacity: 0, x: "-100%", transition: { type: 'spring', stiffness: 260, damping: 30, delay: 0.2 } },
  };

  const mobileLinkVariants = {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0 },
  };
  
  const mobileNavContainerVariants = {
    open: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
    closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
  };


  return (
    <nav className="bg-background/95 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-20">
          <div className="absolute left-0 flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-foreground">WIIBEC</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
            {user ? (
              <>
                {dropdownItems.map((item) => (
                  <DesktopNavItem key={item.name} {...item} />
                ))}
              </>
            ) : (
              <>
                {mainNavItems.map((item) => (
                  <DesktopNavItem key={item.name} {...item} />
                ))}
              </>
            )}
          </div>

          <div className="absolute right-0 hidden md:flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSwitcher />
            {user ? (
              <>
                <Link to="/donate">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Heart className="w-4 h-4 mr-2" />
                    {t('navbar.donate')}
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
                      <span>{t('navbar.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">{t('navbar.login')}</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('navbar.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="absolute right-0 flex items-center md:hidden">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="z-50"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence onExitComplete={onAnimationComplete}>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className="fixed inset-0 z-40 bg-background md:hidden"
          >
            <motion.div 
              className="h-full flex flex-col justify-between py-24 px-8"
              variants={mobileNavContainerVariants}
            >
              <div className="flex flex-col items-center space-y-6">
                {user ? (
                  <>
                    {dropdownItems.map((item) => (
                      <motion.div variants={mobileLinkVariants} key={item.path}>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `flex items-center text-3xl font-bold transition-colors duration-300 ${
                              isActive ? 'text-primary' : 'text-foreground hover:text-primary/80'
                            }`
                          }
                          onClick={() => setIsOpen(false)}
                        >
                           <item.icon className="mr-4 h-7 w-7" />
                          {item.name}
                        </NavLink>
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <>
                    {mainNavItems.map((item) => (
                       <motion.div variants={mobileLinkVariants} key={item.path}>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `text-3xl font-bold transition-colors duration-300 ${
                              isActive ? 'text-primary' : 'text-foreground hover:text-primary/80'
                            }`
                          }
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </NavLink>
                       </motion.div>
                    ))}
                  </>
                )}
              </div>
              
              <div className="space-y-4">
                 {user ? (
                   <>
                      <motion.div variants={mobileLinkVariants}>
                         <Button onClick={handleLogout} size="lg" variant="destructive" className="w-full text-lg"><LogOut className="w-5 h-5 mr-3" />{t('navbar.logout')}</Button>
                      </motion.div>
                   </>
                 ) : (
                   <>
                      <motion.div variants={mobileLinkVariants}>
                        <Link to="/login" className="block" onClick={() => setIsOpen(false)}>
                          <Button size="lg" variant="outline" className="w-full text-lg">{t('navbar.login')}</Button>
                        </Link>
                      </motion.div>
                      <motion.div variants={mobileLinkVariants}>
                        <Link to="/register" className="block" onClick={() => setIsOpen(false)}>
                          <Button size="lg" className="w-full text-lg bg-primary text-primary-foreground"><UserPlus className="w-5 h-5 mr-3" />{t('navbar.register')}</Button>
                        </Link>
                      </motion.div>
                   </>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;