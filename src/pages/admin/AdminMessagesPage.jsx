
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Mail, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

const AdminMessagesPage = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les messages.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
        // Update local state to reflect the change
        setMessages(messages.map(m => m.id === message.id ? { ...m, status: 'read' } : m));
      } catch(error) {
        console.error("Failed to update message status:", error)
      }
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleString('fr-CA') : 'N/A';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <Badge variant="default" className="bg-blue-500">Nouveau</Badge>;
      case 'read': return <Badge variant="secondary">Lu</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Messages - Administration</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
           <h1 className="text-3xl font-bold tracking-tight">Boîte de réception</h1>
            <Button variant="outline" size="icon" onClick={fetchMessages} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Messages de contact</CardTitle>
            <CardDescription>Messages reçus via le formulaire de contact.</CardDescription>
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
                      <TableHead>Statut</TableHead>
                      <TableHead>De</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Reçu le</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {messages.length > 0 ? messages.map((message) => (
                      <TableRow key={message.id} className={message.status === 'new' ? 'font-bold' : ''}>
                          <TableCell>{getStatusBadge(message.status)}</TableCell>
                          <TableCell>{message.name}</TableCell>
                          <TableCell>{message.email}</TableCell>
                          <TableCell className="max-w-xs truncate">{message.message}</TableCell>
                          <TableCell>{formatDate(message.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleViewMessage(message)}>
                              Voir
                            </Button>
                          </TableCell>
                      </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Aucun message pour le moment.
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
              <DialogTitle className="flex items-center"><MessageSquare className="mr-2 h-5 w-5" /> Message de {selectedMessage.name}</DialogTitle>
              <DialogDescription>
                Reçu le {formatDate(selectedMessage.created_at)}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
              <div className="border-t pt-4">
                <p className="text-sm font-medium">Contact :</p>
                <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
              </div>
            </div>
            <DialogFooter>
              <a href={`mailto:${selectedMessage.email}?subject=Re: Votre message à WIIBEC`} className="w-full">
                <Button className="w-full">
                  <Mail className="mr-2 h-4 w-4" /> Répondre par e-mail
                </Button>
              </a>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Fermer
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
