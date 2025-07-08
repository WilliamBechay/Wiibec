import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Mail, MessageSquare, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';

const AdminMessagesPage = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useTranslation('admin');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*, invoices(invoice_number)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      toast({ title: t('common:errors.error'), description: t('messages.loadError'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    if (message.status === 'new') {
      try {
        const { error } = await supabase
          .from('contact_messages')
          .update({ status: 'read' })
          .eq('id', message.id);
        if (error) throw error;
        setMessages(messages.map(m => m.id === message.id ? { ...m, status: 'read' } : m));
      } catch(error) {
        console.error("Failed to update message status:", error)
      }
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleString('fr-CA') : 'N/A';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <Badge variant="default" className="bg-blue-500">{t('messages.status.new')}</Badge>;
      case 'read': return <Badge variant="secondary">{t('messages.status.read')}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('messages.title')}</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
           <h1 className="text-3xl font-bold tracking-tight">{t('messages.heading')}</h1>
            <Button variant="outline" size="icon" onClick={fetchMessages} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('messages.cardTitle')}</CardTitle>
            <CardDescription>{t('messages.cardDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                      <TableRow>
                      <TableHead>{t('messages.table.status')}</TableHead>
                      <TableHead>{t('messages.table.from')}</TableHead>
                      <TableHead>{t('messages.table.subject')}</TableHead>
                      <TableHead>{t('messages.table.relatedInvoice')}</TableHead>
                      <TableHead>{t('messages.table.receivedOn')}</TableHead>
                      <TableHead className="text-right">{t('messages.table.action')}</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {messages.length > 0 ? messages.map((message) => (
                      <TableRow key={message.id} className={message.status === 'new' ? 'font-bold' : ''}>
                          <TableCell>{getStatusBadge(message.status)}</TableCell>
                          <TableCell>
                            <div className="font-medium">{message.name}</div>
                            <div className="text-sm text-muted-foreground">{message.email}</div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{message.subject}</TableCell>
                          <TableCell>
                            {message.invoices ? (
                               <Badge variant="outline">
                                 <FileText className="mr-2 h-3 w-3" />
                                 {message.invoices.invoice_number}
                               </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(message.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleViewMessage(message)}>
                              {t('messages.viewButton')}
                            </Button>
                          </TableCell>
                      </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            {t('messages.noMessages')}
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {selectedMessage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="flex items-center"><MessageSquare className="mr-2 h-5 w-5" /> {selectedMessage.subject || t('messages.dialog.title', { name: selectedMessage.name })}</DialogTitle>
              <div className="text-sm text-muted-foreground pt-2">
                {t('messages.dialog.receivedOn', { date: formatDate(selectedMessage.created_at) })}
                {selectedMessage.invoices && (
                  <div className="mt-2">
                    <Badge variant="secondary">
                       <FileText className="mr-2 h-4 w-4" />
                      {t('messages.dialog.relatedInvoice')} {selectedMessage.invoices.invoice_number}
                    </Badge>
                  </div>
                )}
              </div>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
              <div className="border-t pt-4">
                <p className="text-sm font-medium">{t('messages.dialog.contactInfo')}</p>
                <p className="text-sm text-muted-foreground">{selectedMessage.name} - {selectedMessage.email}</p>
              </div>
            </div>
            <DialogFooter>
              <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`} className="w-full">
                <Button className="w-full">
                  <Mail className="mr-2 h-4 w-4" /> {t('messages.dialog.replyButton')}
                </Button>
              </a>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t('messages.dialog.closeButton')}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AdminMessagesPage;