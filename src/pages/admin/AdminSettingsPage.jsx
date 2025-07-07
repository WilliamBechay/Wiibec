import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const AdminSettingsPage = () => {
  const { settings, loading, updateSetting } = useSettings();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState({});
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (!loading) {
      setLocalSettings(settings);
    }
  }, [settings, loading]);

  const handleToggle = async (pageKey, isEnabled) => {
    setUpdating(prev => ({ ...prev, [pageKey]: true }));
    const { success, error } = await updateSetting(pageKey, isEnabled);
    if (success) {
      toast({
        title: 'Paramètre mis à jour',
        description: `La page "${settings[pageKey].page_name}" a été ${isEnabled ? 'activée' : 'désactivée'}.`,
      });
    } else {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour le paramètre: ${error.message}`,
        variant: 'destructive',
      });
      // Revert UI on failure
      setLocalSettings(prev => ({
        ...prev,
        [pageKey]: { ...prev[pageKey], is_enabled: !isEnabled }
      }));
    }
    setUpdating(prev => ({ ...prev, [pageKey]: false }));
  };

  const sortedSettings = Object.values(localSettings).sort((a, b) => a.page_name.localeCompare(b.page_name));

  return (
    <>
      <Helmet>
        <title>Settings - Administration</title>
        <meta name="description" content="Gérez les paramètres généraux de la plateforme." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Visibilité des pages</CardTitle>
            <CardDescription>
              Activez ou désactivez l'accès public aux différentes pages du site. Les administrateurs y auront toujours accès.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {sortedSettings.map((setting) => (
                  <div key={setting.page_key} className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor={setting.page_key} className="text-lg font-medium">
                      {setting.page_name}
                    </Label>
                    <div className="flex items-center space-x-2">
                      {updating[setting.page_key] && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Switch
                        id={setting.page_key}
                        checked={setting.is_enabled}
                        onCheckedChange={(checked) => handleToggle(setting.page_key, checked)}
                        disabled={updating[setting.page_key]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AdminSettingsPage;