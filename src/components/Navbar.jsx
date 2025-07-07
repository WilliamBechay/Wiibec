import React, { useState, useEffect } from 'react';
    import { Link, NavLink, useNavigate } from 'react-router-dom';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Menu, X, LogOut, Settings, Heart, Shield, LayoutDashboard, UserPlus, Globe } from 'lucide-react';
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
    import { cn } from '@/lib/utils';

    const Navbar = () => {
      const [isOpen, setIsOpen] = useState(false);
      const { user, profile, logout } = useAuth();
      const navigate = useNavigate();
      const { t } = useTranslation('common');

      useEffect(() => {
        const body = document.querySelector('body');
        if (isOpen) {
          body.style.overflow = 'hidden';
        } else {
          body.style.overflow = 'auto';
        }
        return () => {
          body.style.overflow = 'auto';
        };
      }, [isOpen]);

      const handleLogout = async () => {
        setIsOpen(false);
        await logout();
        navigate('/');
      };
      
      const mainNavItems = [
        { name: t('navbar.home'), path: '/' },
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
        closed: { x: "-100%", transition: { type: "tween", duration: 0.3, ease: "easeOut" } },
        open: { x: 0, transition: { type: "tween", duration: 0.3, ease: "easeIn" } },
      };

      const backdropVariants = {
        closed: { opacity: 0, transition: { duration: 0.3 } },
        open: { opacity: 1, transition: { duration: 0.3 } },
      };

      return (
        <>
          <nav className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                
                <div className="flex justify-start items-center">
                  <Link to="/" className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-foreground">WIIBEC</span>
                  </Link>
                </div>

                <div className="flex justify-end items-center">
                  <div className="hidden md:flex items-center space-x-6">
                    <div className="flex items-center space-x-8">
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

                    <div className="flex items-center space-x-2">
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
                  </div>
                  
                  <div className="flex items-center md:hidden">
                    <ThemeToggle />
                    <LanguageSwitcher />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(!isOpen)}
                      className="z-50 ml-2"
                      aria-label="Toggle menu"
                    >
                      <Menu className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </nav>

          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  variants={backdropVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                />
                <motion.div
                  variants={mobileMenuVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="fixed top-0 left-0 bottom-0 w-3/4 max-w-sm z-50 bg-background border-r border-border p-6 md:hidden flex flex-col"
                >
                  <div className="flex justify-between items-center mb-8">
                    <Link to="/" className="flex items-center space-x-3" onClick={() => setIsOpen(false)}>
                      <span className="text-2xl font-bold text-foreground">WIIBEC</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      aria-label="Close menu"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="flex-grow">
                    {user ? (
                      <div className="space-y-4">
                        {dropdownItems.map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => cn(
                              'flex items-center text-lg font-medium transition-colors duration-300 p-3 rounded-lg',
                              isActive ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-accent'
                            )}
                          >
                            <item.icon className="mr-4 h-5 w-5" />
                            {item.name}
                          </NavLink>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {mainNavItems.map((item) => (
                           <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => cn(
                              'block text-lg font-medium transition-colors duration-300 p-3 rounded-lg',
                              isActive ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-accent'
                            )}
                          >
                            {item.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto space-y-3">
                     {user ? (
                        <>
                           <Link to="/donate" className="block" onClick={() => setIsOpen(false)}>
                            <Button size="lg" className="w-full text-lg bg-primary text-primary-foreground hover:bg-primary/90"><Heart className="w-5 h-5 mr-3" />{t('navbar.donate')}</Button>
                          </Link>
                          <Button onClick={handleLogout} size="lg" variant="destructive" className="w-full text-lg"><LogOut className="w-5 h-5 mr-3" />{t('navbar.logout')}</Button>
                        </>
                      ) : (
                        <>
                          <Link to="/login" className="block" onClick={() => setIsOpen(false)}>
                            <Button size="lg" variant="outline" className="w-full text-lg">{t('navbar.login')}</Button>
                          </Link>
                          <Link to="/register" className="block" onClick={() => setIsOpen(false)}>
                            <Button size="lg" className="w-full text-lg bg-primary text-primary-foreground"><UserPlus className="w-5 h-5 mr-3" />{t('navbar.register')}</Button>
                          </Link>
                        </>
                      )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      );
    };

    export default Navbar;