import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Users, TrendingUp, Coins as HandCoins } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const StatCard = ({ title, value, icon: Icon, description, currency = '' }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{currency}{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const AdminAnalyticsPage = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalUsers: 0,
    averageDonation: 0,
    donationCount: 0,
  });
  const [donationsByDate, setDonationsByDate] = useState([]);
  const [usersByDate, setUsersByDate] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch stats
        const { data: donationsData, error: donationsError } = await supabase
          .from('donations')
          .select('amount, created_at')
          .eq('status', 'succeeded');
        if (donationsError) throw donationsError;
        
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (usersError) throw usersError;
        
        const totalDonations = donationsData.reduce((acc, d) => acc + d.amount, 0);
        const donationCount = donationsData.length;
        const averageDonation = donationCount > 0 ? totalDonations / donationCount : 0;

        // Process donations by date
        const donationsGrouped = donationsData.reduce((acc, d) => {
          const date = new Date(d.created_at).toLocaleDateString('fr-CA');
          acc[date] = (acc[date] || 0) + d.amount;
          return acc;
        }, {});
        const donationsChartData = Object.entries(donationsGrouped)
          .map(([date, total]) => ({ date, total: parseFloat(total.toFixed(2)) }))
          .sort((a,b) => new Date(a.date) - new Date(b.date));

        // Fetch users by date
        const { data: usersData, error: usersDateError } = await supabase
          .from('profiles')
          .select('created_at');
        if(usersDateError) throw usersDateError;

        const usersGrouped = usersData.reduce((acc, u) => {
          const date = new Date(u.created_at).toLocaleDateString('fr-CA');
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        
        let cumulativeUsers = 0;
        const usersChartData = Object.entries(usersGrouped)
          .sort((a,b) => new Date(a[0]) - new Date(b[0]))
          .map(([date, count]) => {
            cumulativeUsers += count;
            return { date, count: cumulativeUsers };
          });


        // Fetch recent donations
        const { data: recentData, error: recentError } = await supabase
          .from('donations')
          .select('id, amount, created_at, profile:profiles(first_name, last_name)')
          .eq('status', 'succeeded')
          .order('created_at', { ascending: false })
          .limit(5);
        if (recentError) throw recentError;

        setStats({
          totalDonations: totalDonations.toFixed(2),
          totalUsers: usersCount,
          averageDonation: averageDonation.toFixed(2),
          donationCount
        });
        setDonationsByDate(donationsChartData);
        setUsersByDate(usersChartData);
        setRecentDonations(recentData);

      } catch (error) {
        toast({
          title: 'Erreur lors de la récupération des données',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-CA');

  return (
    <>
      <Helmet>
        <title>Analytics - Administration</title>
        <meta name="description" content="Tableau de bord des analyses de la plateforme." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        
        {loading ? (
          <div className="text-center p-10">Chargement des données...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Revenus totaux" value={stats.totalDonations} icon={DollarSign} description="Total des dons réussis" currency="$" />
              <StatCard title="Total utilisateurs" value={stats.totalUsers} icon={Users} description="Nombre total d'inscrits" />
              <StatCard title="Don moyen" value={stats.averageDonation} icon={HandCoins} description={`Basé sur ${stats.donationCount} dons`} currency="$" />
              <StatCard title="Total des dons" value={stats.donationCount} icon={TrendingUp} description="Nombre de transactions" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Dons par jour</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={donationsByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Total']} />
                      <Legend />
                      <Bar dataKey="total" fill="#8884d8" name="Total des dons" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Croissance des utilisateurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usersByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Utilisateurs']} />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Total utilisateurs cumulés" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Dons récents</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donateur</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDonations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          {donation.profile ? `${donation.profile.first_name} ${donation.profile.last_name}` : 'Anonyme'}
                        </TableCell>
                        <TableCell className="text-right font-medium">${donation.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{formatDate(donation.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
    </>
  );
};

export default AdminAnalyticsPage;