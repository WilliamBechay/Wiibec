import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const DonationGoal = () => {
  const [totalDonated, setTotalDonated] = useState(0);
  const [settings, setSettings] = useState({
    goal_amount: 10000,
    base_progress_percentage: 25,
    title: 'Notre Objectif Commun',
    description: 'Aidez-nous à atteindre notre objectif pour financer la prochaine vague d\'ateliers d\'éducation financière !'
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [donationsRes, settingsRes] = await Promise.all([
          supabase.from('donations').select('amount').eq('status', 'succeeded'),
          supabase.from('donation_goal_settings').select('*').limit(1).single()
        ]);

        if (donationsRes.error) throw donationsRes.error;
        if (settingsRes.error) throw settingsRes.error;

        if (settingsRes.data) {
          setSettings(settingsRes.data);
        }

        const sum = donationsRes.data.reduce((acc, current) => acc + Number(current.amount), 0);
        setTotalDonated(sum);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const GOAL_AMOUNT = Number(settings.goal_amount);
  const BASE_PROGRESS_PERCENTAGE = Number(settings.base_progress_percentage);
  const BASE_PROGRESS = GOAL_AMOUNT * (BASE_PROGRESS_PERCENTAGE / 100);

  const amountRaised = totalDonated + BASE_PROGRESS;
  const progressPercentage = Math.min((amountRaised / GOAL_AMOUNT) * 100, 100);

  return (
    <section id="donation-goal" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          <Card className="shadow-2xl border-2 border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center items-center gap-2 text-primary">
                <Target className="w-8 h-8" />
                <CardTitle className="text-3xl md:text-4xl font-extrabold">{settings.title}</CardTitle>
              </div>
              <CardDescription className="text-lg md:text-xl text-muted-foreground mt-2">
                {settings.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-between items-end mb-2 font-bold text-lg">
                <span className="text-primary">{formatCurrency(amountRaised)}</span>
                <span className="text-muted-foreground">{formatCurrency(GOAL_AMOUNT)}</span>
              </div>
              <Progress value={loading ? 0 : progressPercentage} className="h-5" />
              <div className="text-center mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : progressPercentage.toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground">de l'objectif atteint</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default DonationGoal;