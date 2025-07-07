
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
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez vous connecter pour faire un don.",
      });
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
          title: "Erreur Stripe",
          description: stripeError.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <form onSubmit={handleSubmit}>
        <Tabs value={donationType} onValueChange={setDonationType} className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal"><Heart className="w-4 h-4 mr-2"/>Don Personnel</TabsTrigger>
            <TabsTrigger value="company"><Building className="w-4 h-4 mr-2"/>Don d'Entreprise</TabsTrigger>
          </TabsList>
          <TabsContent value="company" className="mt-4 space-y-4">
            <div>
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nom de votre entreprise" required={donationType === 'company'} />
            </div>
            <div>
              <Label htmlFor="companyAddress">Adresse de l'entreprise</Label>
              <Input id="companyAddress" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Adresse pour le reçu fiscal" required={donationType === 'company'} />
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
            placeholder="Autre"
            value={customAmount}
            onChange={handleCustomAmountChange}
            className={`text-center ${customAmount ? 'border-primary' : ''} col-span-2 sm:col-span-1`}
          />
        </div>

        <Button type="submit" disabled={loading || finalAmount <= 0} className="w-full text-lg font-bold py-6">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Traitement...</> : `Faire un don de ${finalAmount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}`}
        </Button>
      </form>
    </motion.div>
  );
};

const DonatePage = () => {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <Helmet>
        <title>Faire un don - WIIBEC</title>
        <meta name="description" content="Soutenez notre mission d'éducation financière pour les jeunes. Chaque don compte." />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30 p-6 sm:p-8 text-center">
            <CardTitle className="text-3xl sm:text-4xl font-extrabold text-primary">Soutenez notre mission</CardTitle>
            <CardDescription className="text-lg sm:text-xl text-muted-foreground mt-2">Votre générosité est le moteur de notre impact.</CardDescription>
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
