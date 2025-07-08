import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const AuthContext = createContext();

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };

    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [profile, setProfile] = useState(null);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      const getProfile = useCallback(async (user, retries = 3, delay = 500) => {
        if (!user) {
          setLoading(false);
          return;
        }
        
        try {
          let profileData = null;
          for (let i = 0; i < retries; i++) {
            const { data, error, status } = await supabase
              .from('profiles')
              .select(`*`)
              .eq('id', user.id)
              .maybeSingle();

            if (data) {
              profileData = data;
              break;
            }

            if (error && status !== 406) { // 406 is "Not Acceptable", returned by maybeSingle when no rows are found
              throw error;
            }
            
            if (i < retries - 1) {
              await new Promise(res => setTimeout(res, delay));
            }
          }

          setProfile(profileData);
          
        } catch (error) {
          console.error('Error fetching profile:', error.message);
          setProfile(null); // Ensure profile is null on error
        } finally {
          setLoading(false);
        }
      }, []);

      useEffect(() => {
        setLoading(true);
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            getProfile(currentUser);
          } else {
            setProfile(null);
            setLoading(false);
          }
        });

        const checkUser = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            await getProfile(currentUser);
          } else {
            setLoading(false);
          }
        };
        checkUser();

        return () => {
          subscription?.unsubscribe();
        };
      }, [getProfile]);

      const login = async (email, password) => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }
        // Auth state change will trigger profile fetching
        return { success: true };
      };

      const register = async ({ email, password, firstName, lastName }) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data };
      };

      const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) {
          toast({
            title: "Erreur de connexion Google",
            description: error.message,
            variant: "destructive",
          });
        }
      };

      const logout = async () => {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Error signing out:', error.message);
          // Ignore session not found errors, as the user is effectively logged out.
          if (error.message !== 'User from sub claim in JWT does not exist' && error.message !== 'Session from session_id claim in JWT does not exist') {
            toast({
              title: "Erreur de déconnexion",
              description: error.message,
              variant: "destructive",
            });
          }
        }
        
        // Force clear local storage tokens and state for a clean slate, regardless of error
        setUser(null);
        setProfile(null);
      };

      const resetPasswordForEmail = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      };

      const updatePassword = async (newPassword) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      };

      const updateProfile = async (updatedData) => {
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .update({
            first_name: updatedData.first_name,
            last_name: updatedData.last_name,
            phone: updatedData.phone,
          })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } else if (data) {
          setProfile(data);
          toast({ title: "Profil mis à jour", description: "Vos informations ont été sauvegardées." });
        }
      };

      const value = {
        user,
        profile,
        login,
        register,
        signInWithGoogle,
        logout,
        resetPasswordForEmail,
        updatePassword,
        updateProfile,
        loading,
        isAdmin: profile?.is_admin === true,
      };

      return (
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
      );
    };