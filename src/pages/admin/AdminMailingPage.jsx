import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ReactQuill from 'react-quill';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, Loader2, Info, RefreshCw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link'],
    ['clean']
  ],
};

const AdminMailingPage = () => {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientGroup, setRecipientGroup] = useState('all');
  const [isSending, setIsSending] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les campagnes.', variant: 'destructive' });
    } finally {
      setLoadingCampaigns(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSendCampaign = async () => {
    if (!subject || !body || !recipientGroup) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }
    setIsSending(true);

    let campaignId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          subject,
          body_html: body,
          recipient_group: recipientGroup,
          status: 'sending',
          created_by: user.id
        })
        .select()
        .single();
      
      if (campaignError) throw campaignError;
      campaignId = campaignData.id;
      
      await fetchCampaigns();

      const { data, error: functionError } = await supabase.functions.invoke('send-campaign-email', {
        body: { campaignId: campaignData.id, recipientGroup },
      });

      if (functionError) throw functionError;
      
      toast({ title: 'Succès !', description: data.message || 'Campagne envoyée avec succès.' });
      setSubject('');
      setBody('');
      
    } catch (error) {
      toast({ title: 'Erreur', description: `L'envoi a échoué: ${error.message}`, variant: 'destructive' });
      if (campaignId) {
        await supabase.from('campaigns').update({ status: 'failed' }).eq('id', campaignId);
      }
    } finally {
      setIsSending(false);
      await fetchCampaigns();
    }
  };
  
  const formatDate = (date) => date ? new Date(date).toLocaleString('fr-CA') : 'N/A';
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent': return <span className="px-2 py-1 text-xs font-medium text-green-300 bg-green-900/50 rounded-full">Envoyé</span>;
      case 'draft': return <span className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-700/50 rounded-full">Brouillon</span>;
      case 'sending': return <span className="px-2 py-1 text-xs font-medium text-blue-300 bg-blue-900/50 rounded-full">Envoi...</span>;
      case 'failed': return <span className="px-2 py-1 text-xs font-medium text-red-300 bg-red-900/50 rounded-full">Échoué</span>;
      default: return <span className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-700/50 rounded-full">{status}</span>;
    }
  };


  return (
    <>
      <Helmet>
        <title>Mailing - Administration</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
           <h1 className="text-3xl font-bold tracking-tight">Mailing</h1>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm"><Info className="mr-2 h-4 w-4"/>Configuration requise</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Configuration du service d'envoi d'e-mails</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4 text-sm text-muted-foreground mt-2">
                    <p>Pour envoyer des e-mails, ce système utilise un service tiers (par exemple, Resend, SendGrid, Mailgun). Vous devez configurer une clé API pour que cela fonctionne.</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Inscrivez-vous sur un service comme <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Resend.com</a>.</li>
                        <li>Générez une clé API.</li>
                        <li>Contactez le support pour ajouter cette clé à vos secrets Supabase sous le nom `RESEND_API_KEY`.</li>
                        <li>Configurez également `FROM_EMAIL` avec l'adresse e-mail d'expédition que vous avez validée.</li>
                    </ol>
                    <p className="font-bold text-foreground">Sans cette configuration, les e-mails ne seront pas réellement envoyés.</p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Compris</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>

        <Tabs defaultValue="compose">
          <TabsList>
            <TabsTrigger value="compose">Composer</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle campagne</CardTitle>
                <CardDescription>Rédigez et envoyez un e-mail à un groupe d'utilisateurs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="subject">Sujet</Label>
                        <Input id="subject" placeholder="Le sujet de votre e-mail" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="recipientGroup">Destinataires</Label>
                        <Select value={recipientGroup} onValueChange={setRecipientGroup}>
                        <SelectTrigger id="recipientGroup">
                            <SelectValue placeholder="Sélectionnez un groupe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les utilisateurs</SelectItem>
                            <SelectItem value="donors">Donateurs</SelectItem>
                            <SelectItem value="admins">Administrateurs</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                  <Label>Corps de l'e-mail</Label>
                   <ReactQuill theme="snow" value={body} onChange={setBody} modules={quillModules} className="bg-card text-foreground"/>
                </div>
                 <div className="flex justify-end">
                    <Button onClick={handleSendCampaign} disabled={isSending}>
                      {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      {isSending ? 'Envoi en cours...' : 'Envoyer la campagne'}
                    </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Historique des campagnes</CardTitle>
                    <CardDescription>Liste de toutes les campagnes envoyées ou en brouillon.</CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={fetchCampaigns} disabled={loadingCampaigns}>
                    <RefreshCw className={`h-4 w-4 ${loadingCampaigns ? 'animate-spin' : ''}`} />
                  </Button>
                </CardHeader>
                <CardContent>
                    {loadingCampaigns ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Sujet</TableHead>
                                <TableHead>Destinataires</TableHead>
                                <TableHead>Date d'envoi</TableHead>
                                <TableHead className="text-right">Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.length > 0 ? campaigns.map((campaign) => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-medium max-w-xs truncate">{campaign.subject}</TableCell>
                                    <TableCell>{campaign.recipient_group}</TableCell>
                                    <TableCell>{formatDate(campaign.sent_at)}</TableCell>
                                    <TableCell className="text-right">{getStatusBadge(campaign.status)}</TableCell>
                                </TableRow>
                                )) : (
                                  <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                      Aucune campagne pour le moment.
                                    </TableCell>
                                  </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    )}
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
};

export default AdminMailingPage;