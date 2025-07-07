
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Inbox } from 'lucide-react';

const AdminInvoiceIssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoice_issues')
        .select(`
          *,
          invoice:invoices(invoice_number),
          user:profiles(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les problèmes de factures.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
        title: 'Statut mis à jour',
        description: `Le statut du problème a été changé à "${newStatus}".`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut.',
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
        <title>Gestion des Problèmes de Factures - Admin</title>
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
            <CardTitle>Problèmes de Factures Signalés</CardTitle>
            <CardDescription>
              Consultez et gérez les problèmes de factures soumis par les donateurs.
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
                <h3 className="mt-2 text-sm font-medium text-foreground">Aucun problème signalé</h3>
                <p className="mt-1 text-sm text-muted-foreground">La boîte de réception est vide pour le moment.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facture #</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>{issue.invoice?.invoice_number || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="font-medium">{`${issue.user?.first_name || ''} ${issue.user?.last_name || ''}`}</div>
                        <div className="text-sm text-muted-foreground">{issue.user?.email}</div>
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
                              <Badge variant={getStatusBadgeVariant(issue.status)}>{issue.status}</Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Ouvert</SelectItem>
                            <SelectItem value="in_progress">En cours</SelectItem>
                            <SelectItem value="resolved">Résolu</SelectItem>
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
