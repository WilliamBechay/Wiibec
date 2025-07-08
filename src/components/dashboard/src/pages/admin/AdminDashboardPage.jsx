import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, DollarSign, BarChart, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const StatCard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const AdminDashboardPage = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonationsAmount: 0,
    totalDonationsCount: 0,
  });
  const [usersList, setUsersList] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      try {
        const [usersRes, donationsRes] = await Promise.all([
          supabase.from('profiles').select(`id, first_name, last_name, is_admin, users ( email, created_at )`).order('created_at', { foreignTable: 'users', ascending: false }).limit(5),
          supabase.from('donations').select(`id, amount, created_at, profile:profiles(first_name, last_name, users(email))`).eq('status', 'succeeded').order('created_at', { ascending: false }).limit(5)
        ]);

        if (usersRes.error) throw usersRes.error;
        if (donationsRes.error) throw donationsRes.error;
        
        const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { data: totalDonationsData, error: totalDonationsError } = await supabase.from('donations').select('amount').eq('status', 'succeeded');
        if (totalDonationsError) throw totalDonationsError;

        setUsersList(usersRes.data);
        setDonations(donationsRes.data);

        const totalDonationsAmount = totalDonationsData.reduce((sum, d) => sum + Number(d.amount), 0);
        const totalDonationsCount = totalDonationsData.length;

        setStats({ totalUsers: totalUsers || 0, totalDonationsAmount, totalDonationsCount });
      } catch (error) {
        toast({ title: "Erreur", description: `Impossible de charger les données: ${error.message}`, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, [toast]);

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
  const formatDate = (date) => new Date(date).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <Helmet>
        <title>Dashboard - Administration</title>
        <meta name="description" content="Tableau de bord administrateur pour WIIBEC." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Revenus Totaux" value={formatCurrency(stats.totalDonationsAmount)} icon={DollarSign} />
          <StatCard title="Utilisateurs" value={stats.totalUsers} icon={Users} />
          <StatCard title="Nombre de Dons" value={stats.totalDonationsCount} icon={BarChart} />
        </div>

        <Tabs defaultValue="donations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="donations">Dons Récents</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs Récents</TabsTrigger>
          </TabsList>

          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Dons Récents</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <p>Chargement...</p> : (
                  <div className="space-y-4">
                    {donations.map(d => (
                      <div key={d.id} className="flex items-center">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{d.profile?.first_name} {d.profile?.last_name}</p>
                          <p className="text-sm text-muted-foreground">{d.profile?.users?.email}</p>
                        </div>
                        <div className="ml-auto font-medium text-right">
                          <div>{formatCurrency(d.amount)}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(d.created_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Nouveaux Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <p>Chargement...</p> : (
                  <div className="space-y-4">
                    {usersList.map(u => (
                      <div key={u.id} className="flex items-center">
                         <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{u.first_name} {u.last_name}</p>
                          <p className="text-sm text-muted-foreground">{u.users?.email}</p>
                        </div>
                        <div className="ml-auto text-sm text-muted-foreground text-right flex items-center space-x-2">
                          {u.is_admin && <UserCheck className="h-4 w-4 text-primary" title="Administrateur" />}
                          <span>{formatDate(u.users?.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
};

export default AdminDashboardPage;