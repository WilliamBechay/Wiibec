import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminInvoiceIssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation('admin');

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoice_issues')
        .select(`
          *,
          invoices(invoice_number),
          profiles(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common:errors.error'),
        description: t('invoiceIssues.loadError'),
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('invoice_issues')
        .update({ 
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', issueId)
        .select()
        .single();

      if (error) throw error;

      setIssues(prevIssues =>
        prevIssues.map(issue => (issue.id === issueId ? { ...issue, ...data } : issue))
      );
      toast({
        title: t('invoiceIssues.updateSuccess'),
        description: t('invoiceIssues.updateSuccessDesc', { status: newStatus }),
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common:errors.error'),
        description: t('invoiceIssues.updateError'),
      });
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'default';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-CA', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <>
      <Helmet>
        <title>{t('invoiceIssues.title')}</title>
        <meta name="description" content="Gérez les problèmes de factures signalés par les utilisateurs." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('invoiceIssues.cardTitle')}</CardTitle>
            <CardDescription>
              {t('invoiceIssues.cardDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-16">
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">{t('invoiceIssues.noIssues')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t('invoiceIssues.noIssuesDesc')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('invoiceIssues.table.invoiceNo')}</TableHead>
                    <TableHead>{t('invoiceIssues.table.user')}</TableHead>
                    <TableHead>{t('invoiceIssues.table.description')}</TableHead>
                    <TableHead>{t('invoiceIssues.table.createdDate')}</TableHead>
                    <TableHead>{t('invoiceIssues.table.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>{issue.invoices?.invoice_number || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="font-medium">{`${issue.profiles?.first_name || ''} ${issue.profiles?.last_name || ''}`}</div>
                        <div className="text-sm text-muted-foreground">{issue.profiles?.email}</div>
                      </TableCell>
                      <TableCell className="max-w-sm truncate">{issue.issue_description}</TableCell>
                      <TableCell>{formatDate(issue.created_at)}</TableCell>
                      <TableCell>
                        <Select
                          value={issue.status}
                          onValueChange={(newStatus) => handleStatusChange(issue.id, newStatus)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue>
                              <Badge variant={getStatusBadgeVariant(issue.status)}>{t(`invoiceIssues.status.${issue.status.replace('_', '')}`)}</Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">{t('invoiceIssues.status.open')}</SelectItem>
                            <SelectItem value="in_progress">{t('invoiceIssues.status.inProgress')}</SelectItem>
                            <SelectItem value="resolved">{t('invoiceIssues.status.resolved')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AdminInvoiceIssuesPage;