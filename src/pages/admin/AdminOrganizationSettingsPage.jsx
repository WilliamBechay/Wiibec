import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminOrganizationSettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation('admin');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        toast({
          title: t('common:errors.error'),
          description: t('organization.loadError'),
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
      .from('organization_settings')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast({
        title: t('common:errors.error'),
        description: t('organization.saveError', { error: error.message }),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('auth:resetPasswordPage.successToastTitle'),
        description: t('organization.saveSuccess'),
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
        <title>{t('organization.title')}</title>
        <meta name="description" content="Gérez les informations de votre organisation pour les factures." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold tracking-tight">{t('organization.heading')}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('organization.cardTitle')}</CardTitle>
            <CardDescription>
              {t('organization.cardDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="org_name">{t('organization.form.orgName')}</Label>
                  <Input id="org_name" name="org_name" value={settings.org_name || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_number">{t('organization.form.regNumber')}</Label>
                  <Input id="registration_number" name="registration_number" value={settings.registration_number || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('organization.form.address')}</Label>
                <Input id="address" name="address" value={settings.address || ''} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('organization.form.city')}</Label>
                  <Input id="city" name="city" value={settings.city || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">{t('organization.form.province')}</Label>
                  <Input id="province" name="province" value={settings.province || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">{t('organization.form.postalCode')}</Label>
                  <Input id="postal_code" name="postal_code" value={settings.postal_code || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('organization.form.contactEmail')}</Label>
                  <Input id="email" name="email" type="email" value={settings.email || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">{t('organization.form.website')}</Label>
                  <Input id="website" name="website" type="url" value={settings.website || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {t('organization.saveButton')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AdminOrganizationSettingsPage;