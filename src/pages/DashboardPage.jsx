import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DonationsTab from '@/components/dashboard/DonationsTab';
import InvoicesTab from '@/components/dashboard/InvoicesTab';
import ImpactTab from '@/components/dashboard/ImpactTab';
import ActivityTab from '@/components/dashboard/ActivityTab';
import ReportInvoiceIssueDialog from '@/components/ReportInvoiceIssueDialog';
import DonationPromptCard from '@/components/dashboard/DonationPromptCard';
import { useTranslation } from 'react-i18next';

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ totalDonated: 0, donationCount: 0, lastDonation: null, rank: 'Bronze' });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isReportDialogOpen, setReportDialogOpen] = useState(false);
  const { t } = useTranslation(['user', 'common']);

  useEffect(() => {
    const checkStripeSession = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('session_id')) {
        toast({
          title: t('dashboardPage.paymentSuccessTitle'),
          description: t('dashboardPage.paymentSuccessDescription'),
          variant: 'default',
          className: 'bg-green-500 text-white',
        });
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    checkStripeSession();
  }, [toast, t]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const { data: donationsData, error: donationsError } = await supabase
          .from('donations')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'succeeded')
          .order('created_at', { ascending: false });

        if (donationsError) throw donationsError;
        setDonations(donationsData);

        const totalDonated = donationsData.reduce((sum, d) => sum + Number(d.amount), 0);
        let rank = 'Bronze';
        if (totalDonated >= 500) rank = 'Platine';
        else if (totalDonated >= 250) rank = 'Or';
        else if (totalDonated >= 100) rank = 'Argent';
        setStats({
          totalDonated,
          donationCount: donationsData.length,
          lastDonation: donationsData[0] || null,
          rank,
        });

        if (donationsData.length > 0) {
          const { data: invoicesData, error: invoicesError } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)
            .order('issue_date', { ascending: false });
          
          if (invoicesError) throw invoicesError;
          setInvoices(invoicesData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({ variant: "destructive", title: t('common:errors.error'), description: t('dashboardPage.dataError') });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast, t]);

  const handleReportIssue = (invoice) => {
    setSelectedInvoice(invoice);
    setReportDialogOpen(true);
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const recentActivities = [
    stats.lastDonation ? { type: 'donation', message: t('dashboardPage.recentActivities.donation'), date: stats.lastDonation.created_at } : null,
    { type: 'welcome', message: t('dashboardPage.recentActivities.welcome'), date: user.created_at },
  ].filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <Helmet>
        <title>{t('dashboardPage.helmetTitle')}</title>
        <meta name="description" content={t('dashboardPage.helmetDescription')} />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t('dashboardPage.greeting', { name: profile?.first_name || t('dashboardPage.dearMember') })}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            {t('dashboardPage.thankYou')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <DashboardStats stats={stats} userCreatedAt={user.created_at} />
          </div>
          <div className="lg:col-span-1">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
             >
              <DonationPromptCard />
            </motion.div>
          </div>
        </div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="donations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="donations" className="py-2">{t('dashboardPage.tabs.donations')}</TabsTrigger>
              <TabsTrigger value="invoices" className="py-2">{t('dashboardPage.tabs.invoices')}</TabsTrigger>
              <TabsTrigger value="impact" className="py-2">{t('dashboardPage.tabs.impact')}</TabsTrigger>
              <TabsTrigger value="activity" className="py-2">{t('dashboardPage.tabs.activity')}</TabsTrigger>
            </TabsList>

            <TabsContent value="donations">
              <DonationsTab donations={donations} loading={loading} />
            </TabsContent>
            
            <TabsContent value="invoices">
              <InvoicesTab 
                invoices={invoices} 
                loading={loading} 
                onReportIssue={handleReportIssue} 
              />
            </TabsContent>

            <TabsContent value="impact">
              <ImpactTab stats={stats} />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityTab activities={recentActivities} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      {selectedInvoice && (
        <ReportInvoiceIssueDialog
          open={isReportDialogOpen}
          onOpenChange={setReportDialogOpen}
          invoice={selectedInvoice}
        />
      )}
    </>
  );
};

export default DashboardPage;