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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('admin');

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
      toast({ title: t('common:errors.error'), description: t('mailing.toast.loadError'), variant: 'destructive' });
    } finally {
      setLoadingCampaigns(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSendCampaign = async () => {
    if (!subject || !body || !recipientGroup) {
      toast({ title: t('common:errors.error'), description: t('mailing.toast.validationError'), variant: 'destructive' });
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
      
      toast({ title: t('auth:resetPasswordPage.successToastTitle'), description: data.message || t('mailing.toast.sendSuccess') });
      setSubject('');
      setBody('');
      
    } catch (error) {
      toast({ title: t('common:errors.error'), description: t('mailing.toast.sendError', { error: error.message }), variant: 'destructive' });
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
    const statusText = t(`mailing.campaigns.statusLabels.${status}`, status);
    switch (status) {
      case 'sent': return <span className="px-2 py-1 text-xs font-medium text-green-300 bg-green-900/50 rounded-full">{statusText}</span>;
      case 'draft': return <span className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-700/50 rounded-full">{statusText}</span>;
      case 'sending': return <span className="px-2 py-1 text-xs font-medium text-blue-300 bg-blue-900/50 rounded-full">{statusText}</span>;
      case 'failed': return <span className="px-2 py-1 text-xs font-medium text-red-300 bg-red-900/50 rounded-full">{statusText}</span>;
      default: return <span className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-700/50 rounded-full">{statusText}</span>;
    }
  };


  return (
    <>
      <Helmet>
        <title>{t('mailing.title')}</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
           <h1 className="text-3xl font-bold tracking-tight">{t('mailing.heading')}</h1>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm"><Info className="mr-2 h-4 w-4"/>{t('mailing.configRequired')}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('mailing.configDialog.title')}</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4 text-sm text-muted-foreground mt-2">
                    <p>{t('mailing.configDialog.p1')}</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>{t('mailing.configDialog.li1', {
                          defaultValue: 'Inscrivez-vous sur un service comme <1>Resend.com</1>.',
                          components: { 1: <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary underline" /> }
                        })}</li>
                        <li>{t('mailing.configDialog.li2')}</li>
                        <li>{t('mailing.configDialog.li3')}</li>
                        <li>{t('mailing.configDialog.li4')}</li>
                    </ol>
                    <p className="font-bold text-foreground">{t('mailing.configDialog.p2')}</p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>{t('mailing.configDialog.close')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>

        <Tabs defaultValue="compose">
          <TabsList>
            <TabsTrigger value="compose">{t('mailing.tabs.compose')}</TabsTrigger>
            <TabsTrigger value="campaigns">{t('mailing.tabs.campaigns')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('mailing.compose.title')}</CardTitle>
                <CardDescription>{t('mailing.compose.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="subject">{t('mailing.compose.subject')}</Label>
                        <Input id="subject" placeholder={t('mailing.compose.subjectPlaceholder')} value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="recipientGroup">{t('mailing.compose.recipients')}</Label>
                        <Select value={recipientGroup} onValueChange={setRecipientGroup}>
                        <SelectTrigger id="recipientGroup">
                            <SelectValue placeholder={t('mailing.compose.recipientsPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('mailing.compose.groups.all')}</SelectItem>
                            <SelectItem value="donors">{t('mailing.compose.groups.donors')}</SelectItem>
                            <SelectItem value="admins">{t('mailing.compose.groups.admins')}</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('mailing.compose.body')}</Label>
                   <ReactQuill theme="snow" value={body} onChange={setBody} modules={quillModules} className="bg-card text-foreground"/>
                </div>
                 <div className="flex justify-end">
                    <Button onClick={handleSendCampaign} disabled={isSending}>
                      {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      {isSending ? t('mailing.compose.sendingButton') : t('mailing.compose.sendButton')}
                    </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('mailing.campaigns.title')}</CardTitle>
                    <CardDescription>{t('mailing.campaigns.description')}</CardDescription>
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
                                <TableHead>{t('mailing.campaigns.table.subject')}</TableHead>
                                <TableHead>{t('mailing.campaigns.table.recipients')}</TableHead>
                                <TableHead>{t('mailing.campaigns.table.sentDate')}</TableHead>
                                <TableHead className="text-right">{t('mailing.campaigns.table.status')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.length > 0 ? campaigns.map((campaign) => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-medium max-w-xs truncate">{campaign.subject}</TableCell>
                                    <TableCell>{t(`mailing.compose.groups.${campaign.recipient_group}`)}</TableCell>
                                    <TableCell>{formatDate(campaign.sent_at)}</TableCell>
                                    <TableCell className="text-right">{getStatusBadge(campaign.status)}</TableCell>
                                </TableRow>
                                )) : (
                                  <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                      {t('mailing.campaigns.noCampaigns')}
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