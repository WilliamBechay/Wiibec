
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

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ totalDonated: 0, donationCount: 0, lastDonation: null, rank: 'Bronze' });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isReportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    const checkStripeSession = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('session_id')) {
        toast({
          title: 'Paiement réussi!',
          description: 'Votre donation a été reçue. Merci pour votre soutien!',
          variant: 'default',
          className: 'bg-green-500 text-white',
        });
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    checkStripeSession();
  }, [toast]);

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
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger vos données." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleReportIssue = (invoice) => {
    setSelectedInvoice(invoice);
    setReportDialogOpen(true);
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const recentActivities = [
    stats.lastDonation ? { type: 'donation', message: 'Vous avez fait un don', date: stats.lastDonation.created_at } : null,
    { type: 'welcome', message: 'Bienvenue dans la communauté WIIBEC', date: user.created_at },
  ].filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <Helmet>
        <title>Dashboard - WIIBEC</title>
        <meta name="description" content="Votre espace personnel WIIBEC. Suivez vos donations, consultez votre profil et découvrez votre impact sur l'éducation financière des jeunes." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Bonjour, {profile?.first_name || 'cher membre'} ! 👋
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Merci de soutenir l'éducation financière des jeunes avec WIIBEC
          </p>
        </motion.div>

        <DashboardStats stats={stats} userCreatedAt={user.created_at} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="donations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="donations" className="py-2">Mes Donations</TabsTrigger>
              <TabsTrigger value="invoices" className="py-2">Mes Factures</TabsTrigger>
              <TabsTrigger value="impact" className="py-2">Mon Impact</TabsTrigger>
              <TabsTrigger value="activity" className="py-2">Activité Récente</TabsTrigger>
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
