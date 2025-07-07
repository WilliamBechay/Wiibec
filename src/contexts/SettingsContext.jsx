import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('page_settings').select('*');
      if (error) {
        console.error('Error fetching page settings:', error);
        setSettings({});
      } else {
        const settingsMap = data.reduce((acc, setting) => {
          acc[setting.page_key] = setting;
          return acc;
        }, {});
        setSettings(settingsMap);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSetting = async (pageKey, isEnabled) => {
    const { data, error } = await supabase
      .from('page_settings')
      .update({ is_enabled: isEnabled })
      .eq('page_key', pageKey)
      .select()
      .single();

    if (error) {
      console.error('Error updating setting:', error);
      return { success: false, error };
    }

    setSettings(prev => ({
      ...prev,
      [pageKey]: data,
    }));
    return { success: true };
  };

  const value = {
    settings,
    loading,
    updateSetting,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};