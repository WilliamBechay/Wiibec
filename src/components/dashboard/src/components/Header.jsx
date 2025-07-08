import React from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { BookOpenCheck } from 'lucide-react';
    import { useToast } from "@/components/ui/use-toast";

    const Header = () => {
      const location = useLocation();
      const { toast } = useToast();

      const navLinks = [
        { href: '/', label: 'Accueil' },
        { href: '/about', label: 'À Propos' },
        { href: '/donate', label: 'Faire un Don' },
        { href: '/contact', label: 'Contact' },
      ];

      const handleFeatureClick = () => {
        toast({
          title: "🚧 Bientôt disponible !",
          description: "Cette fonctionnalité n'est pas encore implémentée. Revenez bientôt ! 🚀",
        });
      };

      return (
        <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpenCheck className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">WIIBEC</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="relative text-lg font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {link.label}
                  {location.pathname === link.href && (
                    <motion.div
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-purple-400"
                      layoutId="underline"
                    />
                  )}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleFeatureClick}>Connexion</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleFeatureClick}>
                Inscription
              </Button>
            </div>
          </nav>
        </header>
      );
    };

    export default Header;