import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { HeartHandshake as Handshake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const PartnersPage = () => {
  const { t } = useTranslation('partners');

  return (
    <>
      <Helmet>
        <title>{t('helmetTitle')}</title>
        <meta name="description" content={t('helmetDescription')} />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <motion.h1 
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {t('title')}
          </motion.h1>
          <motion.p 
            className="max-w-2xl mx-auto text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
              <CardHeader className="flex-row items-center gap-4 pb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Handshake className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Mindovest.com</CardTitle>
                  <p className="text-sm text-muted-foreground">{t('mainPartner')}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                  <img  alt={t('logoAlt')} className="object-contain h-20" src="https://images.unsplash.com/photo-1642142785011-4a00c34c4a36" />
                </div>
                <p className="text-muted-foreground">
                  {t('partnerDescription')}
                </p>
                <Button asChild className="w-full">
                  <a href="https://mindovest.com" target="_blank" rel="noopener noreferrer">
                    {t('visitSite')}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default PartnersPage;