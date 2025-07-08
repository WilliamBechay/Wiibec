import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminDonationGoalPage = () => {
  const [settings, setSettings] = useState({
    goal_amount: '',
    base_progress_percentage: '',
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation('admin');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('donation_goal_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        toast({
          title: t('common:errors.error'),
          description: t('donationGoal.loadError'),
          variant: 'destructive',
        });
        console.error(error);
      } else {
        setSettings(data || {});
      }
      setLoading(false);
    };

    fetchSettings();
  }, [toast, t]);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const { id, ...updateData } = settings;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('donation_goal_settings')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast({
        title: t('common:errors.error'),
        description: t('donationGoal.saveError', { error: error.message }),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('auth:resetPasswordPage.successToastTitle'),
        description: t('donationGoal.saveSuccess'),
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('donationGoal.title')}</title>
        <meta name="description" content="Gérez la barre de progression des dons affichée sur la page d'accueil." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold tracking-tight">{t('donationGoal.heading')}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('donationGoal.cardTitle')}</CardTitle>
            <CardDescription>
              {t('donationGoal.cardDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('donationGoal.form.title')}</Label>
                <Input id="title" name="title" value={settings.title || ''} onChange={handleChange} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="description">{t('donationGoal.form.description')}</Label>
                <Textarea id="description" name="description" value={settings.description || ''} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="goal_amount">{t('donationGoal.form.goalAmount')}</Label>
                  <Input id="goal_amount" name="goal_amount" type="number" value={settings.goal_amount || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_progress_percentage">{t('donationGoal.form.basePercentage')}</Label>
                  <Input id="base_progress_percentage" name="base_progress_percentage" type="number" value={settings.base_progress_percentage || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {t('donationGoal.saveButton')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AdminDonationGoalPage;