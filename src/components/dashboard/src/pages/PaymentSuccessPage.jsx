import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('loading');
  const [donationDetails, setDonationDetails] = useState(null);
  const { t, i18n } = useTranslation(['user', 'common']);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionId = query.get('session_id');

    if (!sessionId) {
      setStatus('error');
      toast({
        variant: "destructive",
        title: t('common:errors.error'),
        description: t('paymentSuccessPage.missingSessionId'),
      });
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId },
        });

        if (error) throw new Error(error.message || 'Une erreur est survenue lors de la vérification.');
        
        const responseData = typeof data === 'string' ? JSON.parse(data) : data;

        if (responseData.status === 'success') {
          setStatus('success');
          setDonationDetails(responseData.donation);
          toast({
            title: t('paymentSuccessPage.paymentVerified'),
            description: t('paymentSuccessPage.paymentVerifiedDesc'),
            className: 'bg-green-500 text-white border-green-500'
          });
        } else {
          throw new Error(responseData.message || 'La vérification du paiement a échoué.');
        }
      } catch (error) {
        setStatus('error');
        toast({
          variant: "destructive",
          title: t('paymentSuccessPage.verificationError'),
          description: error.message,
        });
      }
    };

    verifyPayment();
  }, [location, toast, t]);

  const formatCurrency = (value) => {
    const lang = i18n.language === 'fr' ? 'fr-CA' : 'en-US';
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'CAD' }).format(value);
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold">{t('paymentSuccessPage.verifying')}</h1>
            <p className="text-muted-foreground">{t('paymentSuccessPage.verifyingDesc')}</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center flex flex-col items-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-4xl font-extrabold mb-4">{t('paymentSuccessPage.successTitle')}</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
              {t('paymentSuccessPage.successDesc', { amount: formatCurrency(donationDetails?.amount || 0) })}
            </p>
            <p className="mb-8">{t('paymentSuccessPage.receiptInfo')}</p>
            <div className="flex gap-4">
              <Button asChild>
                <Link to="/dashboard">{t('paymentSuccessPage.goToDashboard')}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">{t('paymentSuccessPage.backToHome')}</Link>
              </Button>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="text-center flex flex-col items-center">
            <AlertTriangle className="w-24 h-24 text-destructive mx-auto mb-6" />
            <h1 className="text-4xl font-extrabold mb-4">{t('paymentSuccessPage.errorTitle')}</h1>
            <p className="text-xl text-muted-foreground mb-8">{t('paymentSuccessPage.errorDesc')}</p>
            <Button onClick={() => navigate('/donate')}>{t('paymentSuccessPage.retryButton')}</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[60vh] p-4">
       <Helmet>
        <title>{t('paymentSuccessPage.helmetTitle')}</title>
        <meta name="description" content={t('paymentSuccessPage.helmetDescription')} />
      </Helmet>
      {renderContent()}
    </div>
  );
};

export default PaymentSuccessPage;