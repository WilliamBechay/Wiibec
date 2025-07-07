import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMenuToggle = (open) => {
    setIsMenuOpen(open);
    if (open) {
      setIsAnimating(true);
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const showContent = !isMenuOpen && !isAnimating;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar 
        onMenuToggle={handleMenuToggle} 
        onAnimationComplete={handleAnimationComplete} 
      />
      <main className={`flex-grow w-full ${showContent ? 'block' : 'invisible'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </div>
      </main>
      <div className={showContent ? 'block' : 'invisible'}>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;