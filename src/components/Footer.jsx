import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-background/80 border-t border-border">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-2">
            En partenariat avec <a href="https://mindovest.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary transition-colors">Mindovest</a>
          </p>
          <p>&copy; 2025 Wiibec william bechay. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
