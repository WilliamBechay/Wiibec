import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Edit, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
  const { user, profile, loading, updateProfile, updatePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();
  const { t, i18n } = useTranslation(['user', 'common']);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError('');
  };

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      setPasswordError(t('profilePage.passwordLengthError'));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('profilePage.passwordMismatch'));
      return;
    }
    
    const { success, error } = await updatePassword(passwordData.newPassword);
    if (success) {
      toast({ title: t('profilePage.passwordUpdated'), description: t('profilePage.passwordUpdatedSuccess') });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setPasswordError('');
    } else {
      setPasswordError(error);
      toast({ title: t('common:errors.error'), description: error, variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || ''
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const lang = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(lang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!profile) {
    return <div className="flex justify-center items-center h-screen"><p>{t('profilePage.loadingError')}</p></div>;
  }

  return (
    <>
      <Helmet>
        <title>{t('profilePage.helmetTitle')}</title>
        <meta name="description" content={t('profilePage.helmetDescription')} />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">{t('profilePage.title')}</h1>
            <p className="text-xl text-muted-foreground">{t('profilePage.subtitle')}</p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24 border-2 border-primary">
                  <AvatarImage src={profile.avatar_url} alt={profile.first_name} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">
                {profile.first_name} {profile.last_name}
              </CardTitle>
              <CardDescription>
                {t('profilePage.memberSince', { date: formatDate(profile.created_at) })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{t('profilePage.personalInfo')}</h3>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      {t('profilePage.edit')}
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} size="sm" className="bg-primary text-primary-foreground">
                        <Save className="w-4 h-4 mr-2" />
                        {t('profilePage.save')}
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        {t('profilePage.cancel')}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">{t('profilePage.firstName')}</Label>
                    {isEditing ? (
                      <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-secondary rounded-md">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{profile.first_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">{t('profilePage.lastName')}</Label>
                    {isEditing ? (
                      <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-secondary rounded-md">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{profile.last_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profilePage.email')}</Label>
                    <div className="flex items-center space-x-3 p-3 bg-secondary rounded-md">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('profilePage.phone')}</Label>
                    {isEditing ? (
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-secondary rounded-md">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{profile.phone || t('common:errors.notProvided')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('profilePage.security')}</CardTitle>
              <CardDescription>{t('profilePage.changePassword')}</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('profilePage.newPassword')}</Label>
                  <div className="relative">
                    <Input 
                      id="newPassword" 
                      name="newPassword" 
                      type={showPassword ? "text" : "password"} 
                      value={passwordData.newPassword}                      onChange={handlePasswordChange}
                      required
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('profilePage.confirmNewPassword')}</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={passwordData.confirmPassword} 
                      onChange={handlePasswordChange}
                      required
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </Button>
                  </div>
                </div>
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              </CardContent>
              <CardFooter>
                 <Button type="submit">
                  <Lock className="w-4 h-4 mr-2" />
                  {t('profilePage.changePasswordButton')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ProfilePage;