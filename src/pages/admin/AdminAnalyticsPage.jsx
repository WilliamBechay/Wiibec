import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Users, TrendingUp, Coins as HandCoins } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('admin');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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

        const donationsGrouped = donationsData.reduce((acc, d) => {
          const date = new Date(d.created_at).toLocaleDateString('fr-CA');
          acc[date] = (acc[date] || 0) + d.amount;
          return acc;
        }, {});
        const donationsChartData = Object.entries(donationsGrouped)
          .map(([date, total]) => ({ date, total: parseFloat(total.toFixed(2)) }))
          .sort((a,b) => new Date(a.date) - new Date(b.date));

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
          title: t('analytics.loadError'),
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, t]);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-CA');

  return (
    <>
      <Helmet>
        <title>{t('analytics.title')}</title>
        <meta name="description" content="Tableau de bord des analyses de la plateforme." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold tracking-tight">{t('analytics.heading')}</h1>
        
        {loading ? (
          <div className="text-center p-10">{t('analytics.loading')}</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title={t('analytics.cards.totalRevenue')} value={stats.totalDonations} icon={DollarSign} description={t('analytics.cards.totalRevenueDesc')} currency="$" />
              <StatCard title={t('analytics.cards.totalUsers')} value={stats.totalUsers} icon={Users} description={t('analytics.cards.totalUsersDesc')} />
              <StatCard title={t('analytics.cards.avgDonation')} value={stats.averageDonation} icon={HandCoins} description={t('analytics.cards.avgDonationDesc', { count: stats.donationCount })} currency="$" />
              <StatCard title={t('analytics.cards.totalDonations')} value={stats.donationCount} icon={TrendingUp} description={t('analytics.cards.totalDonationsDesc')} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.charts.donationsPerDay')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={donationsByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}`, t('analytics.charts.donationsTotal')]} />
                      <Legend />
                      <Bar dataKey="total" fill="#8884d8" name={t('analytics.charts.donationsTotal')} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.charts.userGrowth')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usersByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Utilisateurs']} />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#82ca9d" name={t('analytics.charts.cumulativeUsers')} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.recentDonations.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('analytics.recentDonations.donor')}</TableHead>
                      <TableHead className="text-right">{t('analytics.recentDonations.amount')}</TableHead>
                      <TableHead className="text-right">{t('analytics.recentDonations.date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDonations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          {donation.profile ? `${donation.profile.first_name} ${donation.profile.last_name}` : t('analytics.recentDonations.anonymous')}
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