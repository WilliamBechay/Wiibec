import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import GoogleIcon from '@/components/icons/GoogleIcon';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation('auth');

  const from = location.state?.from?.pathname || "/login";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: t('registerPage.errorToastTitle'), description: t('registerPage.passwordMismatch'), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { success, error } = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
    });

    if (success) {
      toast({ title: t('registerPage.successToastTitle'), description: t('registerPage.successToastDescription') });
      navigate(from, { replace: true });
    } else {
      toast({ title: t('registerPage.errorToastTitle'), description: error, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signInWithGoogle();
    // setLoading(false) is not called here because the page will redirect
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-center items-center py-12 px-4"
    >
      <Helmet>
        <title>{t('registerPage.helmetTitle')}</title>
        <meta name="description" content={t('registerPage.helmetDescription')} />
      </Helmet>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">{t('registerPage.title')}</CardTitle>
          <CardDescription>{t('registerPage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('registerPage.firstNameLabel')}</Label>
                <Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="Jean" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('registerPage.lastNameLabel')}</Label>
                <Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Dupont" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('registerPage.emailLabel')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="pl-10" placeholder="votre@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('registerPage.passwordLabel')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} className="pl-10 pr-10" placeholder={t('registerPage.passwordPlaceholder')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('registerPage.confirmPasswordLabel')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} className="pl-10 pr-10" placeholder={t('registerPage.passwordPlaceholder')} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('registerPage.registeringButton')}</> : t('registerPage.registerButton')}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t('registerPage.dividerText')}
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
            {t('registerPage.googleButton')}
          </Button>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              {t('registerPage.haveAccount')}{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                {t('registerPage.login')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RegisterPage;