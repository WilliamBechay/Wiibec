import React from 'react';
    import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
    import { AnimatePresence } from 'framer-motion';

    import Layout from '@/components/Layout';
    import HomePage from '@/pages/HomePage';
    import DonatePage from '@/pages/DonatePage';
    import ContactPage from '@/pages/ContactPage';
    import LoginPage from '@/pages/LoginPage';
    import RegisterPage from '@/pages/RegisterPage';
    import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
    import ResetPasswordPage from '@/pages/ResetPasswordPage';
    import DashboardPage from '@/pages/DashboardPage';
    import ProfilePage from '@/pages/ProfilePage';
    import ProtectedRoute from '@/components/ProtectedRoute';
    import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
    import PageGuard from '@/components/PageGuard';

    import AdminLayout from '@/components/admin/AdminLayout';
    import AdminMailingPage from '@/pages/admin/AdminMailingPage';
    import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
    import AdminLogsPage from '@/pages/admin/AdminLogsPage';
    import AdminSitemapPage from '@/pages/admin/AdminSitemapPage';
    import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
    import AdminInvoicesPage from '@/pages/admin/AdminInvoicesPage';
    import AdminOrganizationSettingsPage from '@/pages/admin/AdminOrganizationSettingsPage';
    import AdminInvoiceIssuesPage from '@/pages/admin/AdminInvoiceIssuesPage';
    import AdminMessagesPage from '@/pages/admin/AdminMessagesPage';
    import AdminDonationGoalPage from '@/pages/admin/AdminDonationGoalPage';

    function App() {
      const location = useLocation();

      return (
        <Layout>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageGuard pageKey="home"><HomePage /></PageGuard>} />
              <Route path="/donate" element={<PageGuard pageKey="donate"><DonatePage /></PageGuard>} />
              <Route path="/contact" element={<PageGuard pageKey="contact"><ContactPage /></PageGuard>} />
              <Route path="/login" element={<PageGuard pageKey="login"><LoginPage /></PageGuard>} />
              <Route path="/register" element={<PageGuard pageKey="register"><RegisterPage /></PageGuard>} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <PageGuard pageKey="dashboard"><DashboardPage /></PageGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <PageGuard pageKey="profile"><ProfilePage /></PageGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="analytics" replace />} />
                <Route path="mailing" element={<AdminMailingPage />} />
                <Route path="messages" element={<PageGuard pageKey="messages_admin"><AdminMessagesPage /></PageGuard>} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="logs" element={<AdminLogsPage />} />
                <Route path="sitemap" element={<AdminSitemapPage />} />
                <Route path="invoices" element={<PageGuard pageKey="invoices_admin"><AdminInvoicesPage /></PageGuard>} />
                <Route path="invoice-issues" element={<PageGuard pageKey="invoice_issues_admin"><AdminInvoiceIssuesPage /></PageGuard>} />
                <Route path="donation-goal" element={<AdminDonationGoalPage />} />
                <Route path="organization" element={<PageGuard pageKey="org_settings_admin"><AdminOrganizationSettingsPage /></PageGuard>} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </Layout>
      );
    }

    export default App;