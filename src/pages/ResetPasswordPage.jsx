
    import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';

    const ResetPasswordPage = () => {
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState('');
      const { updatePassword } = useAuth();
      const navigate = useNavigate();
      const { toast } = useToast();

      useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            // Nothing to do here, we just need the session to be active
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      }, []);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
          setError("Les mots de passe ne correspondent pas.");
          return;
        }
        if (password.length < 6) {
          setError("Le mot de passe doit contenir au moins 6 caractères.");
          return;
        }

        setLoading(true);
        const { success, error: updateError } = await updatePassword(password);
        if (success) {
          toast({ title: "Succès", description: "Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter." });
          navigate('/login');
        } else {
          setError(updateError || "Une erreur est survenue. Veuillez réessayer.");
          toast({ title: "Erreur", description: updateError, variant: "destructive" });
        }
        setLoading(false);
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex justify-center items-center py-12 px-4"
        >
          <Helmet>
            <title>Réinitialiser le mot de passe - WIIBEC</title>
            <meta name="description" content="Définissez un nouveau mot de passe pour votre compte WIIBEC." />
          </Helmet>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-primary">Réinitialiser le mot de passe</CardTitle>
              <CardDescription>Choisissez un nouveau mot de passe sécurisé</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10" placeholder="••••••••" />
                  </div>
                </div>
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Réinitialisation...</> : 'Réinitialiser le mot de passe'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default ResetPasswordPage;
  