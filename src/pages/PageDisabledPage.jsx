import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const PageDisabledPage = () => {
  const { t } = useTranslation('common');
  return (
    <>
      <Helmet>
        <title>{t('pageDisabled.title')}</title>
        <meta name="description" content="Cette page est actuellement indisponible." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center text-center min-h-[60vh] py-12"
      >
        <PowerOff className="w-24 h-24 text-destructive mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">{t('pageDisabled.heading')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {t('pageDisabled.description')}
        </p>
        <Button asChild>
          <Link to="/">{t('pageDisabled.backToHome')}</Link>
        </Button>
      </motion.div>
    </>
  );
};

export default PageDisabledPage;