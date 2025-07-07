import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const { t } = useTranslation('contact');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        });

      if (error) throw error;
      
      toast({
        title: t('successToastTitle'),
        description: t('successToastDescription'),
      });
      setFormData({ name: '', email: '', message: '' });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('errorToastTitle'),
        description: t('errorToastDescription'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <Helmet>
        <title>{t('helmetTitle')}</title>
        <meta name="description" content={t('helmetDescription')} />
      </Helmet>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">{t('title')}</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">{t('formTitle')}</CardTitle>
            <CardDescription>{t('formDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t('nameLabel')}</Label>
                <Input type="text" id="name" required placeholder={t('namePlaceholder')} value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input type="email" id="email" required placeholder={t('emailPlaceholder')} value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t('messageLabel')}</Label>
                <Textarea id="message" rows="5" required placeholder={t('messagePlaceholder')} value={formData.message} onChange={handleChange} />
              </div>
              <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground font-bold" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? t('sendingButton') : t('sendButton')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ContactPage;