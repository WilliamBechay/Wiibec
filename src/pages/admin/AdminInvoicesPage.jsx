import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Search } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceDocument from '@/components/InvoiceDocument';
import { useTranslation } from 'react-i18next';

const AdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { toast } = useToast();
  const { t, i18n } = useTranslation('admin');
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('invoices')
        .select('*, profile:user_id(first_name, last_name, email)', { count: 'exact' })
        .order('issue_date', { ascending: false })
        .range(from, to);

      if (debouncedSearchTerm) {
        query = query.or(`invoice_number.ilike.%${debouncedSearchTerm}%,profile.email.ilike.%${debouncedSearchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        toast({
          title: t('common:errors.error'),
          description: t('invoices.loadError', { error: error.message }),
          variant: 'destructive',
        });
        console.error(error);
      } else {
        setInvoices(data);
        setCount(count);
      }
      setLoading(false);
    };

    fetchInvoices();
  }, [toast, debouncedSearchTerm, page, t]);

  const formatCurrency = (amount) => new Intl.NumberFormat(i18n.language === 'fr' ? 'fr-CA' : 'en-US', { style: 'currency', currency: 'CAD' }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US');

  return (
    <>
      <Helmet>
        <title>{t('invoices.title')}</title>
        <meta name="description" content="Consultez et gérez toutes les factures de dons." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold tracking-tight">{t('invoices.heading')}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('invoices.cardTitle')}</CardTitle>
            <CardDescription>
              {t('invoices.cardDesc')}
            </CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('invoices.searchPlaceholder')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('invoices.table.invoiceNo')}</TableHead>
                      <TableHead>{t('invoices.table.date')}</TableHead>
                      <TableHead>{t('invoices.table.donor')}</TableHead>
                      <TableHead>{t('invoices.table.amount')}</TableHead>
                      <TableHead className="text-right">{t('invoices.table.action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length > 0 ? invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                        <TableCell>
                          <div>{invoice.profile?.first_name} {invoice.profile?.last_name}</div>
                          <div className="text-xs text-muted-foreground">{invoice.profile?.email}</div>
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell className="text-right">
                           <PDFDownloadLink
                              document={<InvoiceDocument invoice={invoice} />}
                              fileName={`recu-wiibec-${invoice.invoice_number}.pdf`}
                            >
                              {({ loading: pdfLoading }) =>
                                pdfLoading ? (
                                  <Button variant="ghost" size="icon" disabled>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="icon">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )
                              }
                            </PDFDownloadLink>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan="5" className="text-center h-24">{t('invoices.noInvoices')}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    Page {page} sur {Math.ceil(count / ITEMS_PER_PAGE)}
                  </span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      Précédent
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * ITEMS_PER_PAGE >= count}>
                      Suivant
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AdminInvoicesPage;