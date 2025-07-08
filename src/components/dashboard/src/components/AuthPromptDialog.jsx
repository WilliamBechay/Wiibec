import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { UserPlus, LogIn } from 'lucide-react';

const AuthPromptDialog = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const handleLogin = () => {
    navigate('/login', { state: { from: { pathname: '/donate' } } });
    onOpenChange(false);
  };

  const handleRegister = () => {
    navigate('/register', { state: { from: { pathname: '/donate' } } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('authPrompt.title')}</DialogTitle>
          <DialogDescription>{t('authPrompt.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row sm:justify-center pt-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <Button onClick={handleLogin} className="w-full sm:w-auto">
            <LogIn className="mr-2 h-4 w-4" />
            {t('authPrompt.loginButton')}
          </Button>
          <Button variant="secondary" onClick={handleRegister} className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            {t('authPrompt.registerButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPromptDialog;