import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Building, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthPromptDialog from '@/components/AuthPromptDialog';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51NIAKSLNtncrL2dnCRI93Zp7Tka287XGrcbWuJulL0FOCYOUA1DPGOQrzuHO3KQ7eGi6SpXiktnKPPd0AYWRGNQr00x8fkdEce');

const DonationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('personal');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { t, i18n } = useTranslation(['donate', 'common']);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleAmountClick = (value) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
    setAmount(0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!user) {
      setShowAuthPrompt(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          amount: finalAmount,
          currency: 'cad',
          donationType,
          companyName,
          companyAddress,
          userId: user.id,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        toast({
          variant: "destructive",
          title: t('stripeError'),
          description: stripeError.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('common:errors.error'),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const lang = i18n.language === 'fr' ? 'fr-CA' : 'en-US';
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'CAD' }).format(value);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <form onSubmit={handleSubmit}>
          <Tabs value={donationType} onValueChange={setDonationType} className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal"><Heart className="w-4 h-4 mr-2"/>{t('personalDonation')}</TabsTrigger>
              <TabsTrigger value="company"><Building className="w-4 h-4 mr-2"/>{t('companyDonation')}</TabsTrigger>
            </TabsList>
            <TabsContent value="company" className="mt-4 space-y-4">
              <div>
                <Label htmlFor="companyName">{t('companyName')}</Label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t('companyNamePlaceholder')} required={donationType === 'company'} />
              </div>
              <div>
                <Label htmlFor="companyAddress">{t('companyAddress')}</Label>
                <Input id="companyAddress" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder={t('companyAddressPlaceholder')} required={donationType === 'company'} />
              </div>
            </TabsContent>
            <TabsContent value="personal"></TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[25, 50, 100, 250, 500].map(val => (
              <Button key={val} type="button" variant={amount === val && !customAmount ? 'default' : 'outline'} onClick={() => handleAmountClick(val)}>${val}</Button>
            ))}
            <Input 
              type="number"
              placeholder={t('otherAmount')}
              value={customAmount}
              onChange={handleCustomAmountChange}
              className={`text-center ${customAmount ? 'border-primary' : ''} col-span-2 sm:col-span-1`}
            />
          </div>

          <Button type="submit" disabled={loading || finalAmount <= 0} className="w-full text-lg font-bold py-6">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('processingButton')}</> : t('submitButton', { amount: formatCurrency(finalAmount) })}
          </Button>
        </form>
      </motion.div>
      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} />
    </>
  );
};

const DonatePage = () => {
  const { t } = useTranslation('donate');
  return (
    <div className="max-w-2xl mx-auto px-4">
      <Helmet>
        <title>{t('helmetTitle')}</title>
        <meta name="description" content={t('helmetDescription')} />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30 p-6 sm:p-8 text-center">
            <CardTitle className="text-3xl sm:text-4xl font-extrabold text-primary">{t('title')}</CardTitle>
            <CardDescription className="text-lg sm:text-xl text-muted-foreground mt-2">{t('subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <DonationForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DonatePage;