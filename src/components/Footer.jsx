
import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm">
          <p>{t('partner')}</p>
          <p>{t('copyright', { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
