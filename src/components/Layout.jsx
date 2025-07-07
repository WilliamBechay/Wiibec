import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;