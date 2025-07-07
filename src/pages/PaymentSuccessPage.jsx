import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('loading');
  const [donationDetails, setDonationDetails] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionId = query.get('session_id');

    if (!sessionId) {
      setStatus('error');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "ID de session manquant.",
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
            title: "Paiement vérifié!",
            description: "Votre don a été enregistré avec succès.",
            className: 'bg-green-500 text-white border-green-500'
          });
        } else {
          throw new Error(responseData.message || 'La vérification du paiement a échoué.');
        }
      } catch (error) {
        setStatus('error');
        toast({
          variant: "destructive",
          title: "Erreur de vérification",
          description: error.message,
        });
      }
    };

    verifyPayment();
  }, [location, toast]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold">Vérification de votre paiement...</h1>
            <p className="text-muted-foreground">Veuillez patienter, nous confirmons votre don et générons votre reçu.</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center flex flex-col items-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-4xl font-extrabold mb-4">Merci pour votre soutien !</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
              Votre don de {donationDetails?.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })} a été traité avec succès.
            </p>
            <p className="mb-8">Un reçu détaillé a été généré et est maintenant disponible dans votre tableau de bord.</p>
            <div className="flex gap-4">
              <Button asChild>
                <Link to="/dashboard">Aller au tableau de bord</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="text-center flex flex-col items-center">
            <AlertTriangle className="w-24 h-24 text-destructive mx-auto mb-6" />
            <h1 className="text-4xl font-extrabold mb-4">Une erreur est survenue</h1>
            <p className="text-xl text-muted-foreground mb-8">Nous n'avons pas pu vérifier votre paiement. Veuillez contacter le support si le problème persiste.</p>
            <Button onClick={() => navigate('/donate')}>Réessayer de faire un don</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[60vh] p-4">
       <Helmet>
        <title>Statut du paiement - WIIBEC</title>
        <meta name="description" content="Page de statut de votre don." />
      </Helmet>
      {renderContent()}
    </div>
  );
};

export default PaymentSuccessPage;