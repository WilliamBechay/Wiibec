import React from 'react';
    import { Helmet } from 'react-helmet';
    import { Link, Navigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Heart, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useAuth } from '@/contexts/AuthContext';
    import DonationGoal from '@/components/DonationGoal';
    import { useTranslation } from 'react-i18next';

    const HomePage = () => {
      const { user, loading } = useAuth();
      const { t } = useTranslation('home');

      const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
      };

      const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
      };

      if (loading) {
        return (
          <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        );
      }

      if (user) {
        return <Navigate to="/dashboard" replace />;
      }

      return (
        <motion.div
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          variants={containerVariants}
        >
          <Helmet>
            <title>WIIBEC - Éducation Financière des Jeunes</title>
            <meta name="description" content="WIIBEC est une ONG dédiée à l'éducation financière des jeunes. Rejoignez-nous pour construire un avenir financier solide." />
          </Helmet>

          <section className="text-center py-16 md:py-28">
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-foreground leading-tight tracking-tighter"
            >
              {t('title1')}
              <br />
              <span className="text-primary">{t('title2')}</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-md sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-6 mb-10"
            >
              {t('subtitle')}
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/donate">
                <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                  {t('makeDonation')} <Heart className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto transition-transform hover:scale-105">
                  {t('contact')} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="https://mindovest.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto transition-transform hover:scale-105">
                  {t('educationalPartner')} <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </motion.div>
          </section>
          
          <DonationGoal />

          <section id="certificate" className="py-20">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl md:text-5xl font-extrabold text-foreground mb-4"
                >
                  {t('officialStatus')}
                </motion.h2>
                <motion.p
                  variants={itemVariants}
                  className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12"
                >
                  {t('officialStatus_p')}
                </motion.p>
                <motion.div
                  variants={itemVariants}
                  className="max-w-lg mx-auto bg-card p-2 rounded-2xl shadow-2xl border border-border"
                >
                  <img
                    src="https://storage.googleapis.com/hostinger-horizons-assets-prod/9df2d7b2-f84d-4320-86bd-d7ae1541ec09/abf9e1e9c78f4096e15af4fb812454f7.webp"
                    alt={t('certificateAlt')}
                    className="rounded-xl w-full"
                  />
                </motion.div>
              </div>
            </section>
        </motion.div>
      );
    };

    export default HomePage;