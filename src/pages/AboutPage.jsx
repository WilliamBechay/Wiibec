import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FAQItem = ({ question, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
    className="bg-card p-6 rounded-lg"
  >
    <h3 className="text-xl font-bold text-primary mb-3">{question}</h3>
    <div className="text-muted-foreground space-y-4">{children}</div>
  </motion.div>
);

const AboutPage = () => {
  const { t } = useTranslation('about');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Helmet>
        <title>{t('helmetTitle')}</title>
        <meta name="description" content={t('helmetDescription')} />
      </Helmet>

      <div className="space-y-24">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6"
            >
              <h1 className="text-5xl md:text-6xl font-bold">
                {t('title')} <span className="text-primary">{t('titleSpan')}</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                {t('subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-secondary/50 rounded-lg">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              <FAQItem question={t('whoAreYou')}>
                <p>{t('whoAreYou_p')}</p>
              </FAQItem>

              <FAQItem question={t('whatIsYourMission')}>
                <p>{t('whatIsYourMission_p')}</p>
              </FAQItem>

              <FAQItem question={t('whyFinancialEducation')}>
                <p>{t('whyFinancialEducation_p1')}</p>
                <ul className="space-y-2 pl-5">
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>{t('why_li1')}</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>{t('why_li2')}</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>{t('why_li3')}</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>{t('why_li4')}</span></li>
                </ul>
                <p className="font-semibold text-foreground">{t('why_p2')}</p>
              </FAQItem>

              <FAQItem question={t('whoAreYourActionsFor')}>
                <p>{t('whoAreYourActionsFor_p')}</p>
              </FAQItem>
              
              <FAQItem question={t('whatDoYouOffer')}>
                <p>{t('whatDoYouOffer_p')}</p>
                <ul className="space-y-2 pl-5">
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>{t('offer_li1')}</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>{t('offer_li2')}</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>{t('offer_li3')}</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>{t('offer_li4')}</span></li>
                </ul>
              </FAQItem>

              <FAQItem question={t('whoLeads')}>
                <p>{t('whoLeads_p')}</p>
              </FAQItem>
              
              <FAQItem question={t('isItFree')}>
                <p>{t('isItFree_p1')}</p>
                <p className="font-semibold text-foreground mt-4">{t('isItFree_p2')}</p>
                 <ul className="space-y-2 pl-5">
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>{t('funded_li1')}</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>{t('funded_li2')}</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>{t('funded_li3')}</span></li>
                </ul>
              </FAQItem>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default AboutPage;