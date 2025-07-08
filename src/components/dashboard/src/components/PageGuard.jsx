import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import PageDisabledPage from '@/pages/PageDisabledPage';

const PageGuard = ({ pageKey, children }) => {
  const { settings, loading: settingsLoading } = useSettings();
  const { isAdmin, loading: authLoading } = useAuth();

  if (settingsLoading || authLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div></div>;
  }

  const pageSetting = settings[pageKey];
  const isPageEnabled = pageSetting ? pageSetting.is_enabled : true;

  if (isPageEnabled || isAdmin) {
    return children;
  }

  return <PageDisabledPage />;
};

export default PageGuard;