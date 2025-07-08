import React, { useState } from 'react';
    import { Helmet } from 'react-helmet';
    import { Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Mail, Loader2, ArrowLeft } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { useTranslation } from 'react-i18next';

    const ForgotPasswordPage = () => {
      const [email, setEmail] = useState('');
      const [loading, setLoading] = useState(false);
      const [submitted, setSubmitted] = useState(false);
      const { resetPasswordForEmail } = useAuth();
      const { toast } = useToast();
      const { t } = useTranslation('auth');

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { success, error } = await resetPasswordForEmail(email);
        if (success) {
          setSubmitted(true);
        } else {
          toast({ title: t('forgotPasswordPage.errorToastTitle'), description: error, variant: "destructive" });
        }
        setLoading(false);
      };

      if (submitted) {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center py-12 px-4"
          >
            <Card className="w-full max-w-md text-center">
              <CardHeader>
                <CardTitle>{t('forgotPasswordPage.checkEmailTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('forgotPasswordPage.checkEmailDescription', { email: email })}
                </p>
                <Link to="/login">
                  <Button className="mt-6 w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('forgotPasswordPage.backToLogin')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        );
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex justify-center items-center py-12 px-4"
        >
          <Helmet>
            <title>{t('forgotPasswordPage.helmetTitle')}</title>
            <meta name="description" content={t('forgotPasswordPage.helmetDescription')} />
          </Helmet>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-primary">{t('forgotPasswordPage.title')}</CardTitle>
              <CardDescription>{t('forgotPasswordPage.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('forgotPasswordPage.emailLabel')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="votre@email.com" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('forgotPasswordPage.sendingButton')}</> : t('forgotPasswordPage.sendLinkButton')}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm">
                <Link to="/login" className="font-medium text-primary hover:text-primary/80 flex items-center justify-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('forgotPasswordPage.backToLogin')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default ForgotPasswordPage;