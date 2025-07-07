import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useDebounce from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const LOGS_PER_PAGE = 15;

const AdminLogsPage = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { t, i18n } = useTranslation('admin');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        let query = supabase.from('logs').select('*', { count: 'exact' });

        if (debouncedSearchTerm) {
          query = query.ilike('message', `%${debouncedSearchTerm}%`);
        }
        if (logLevel !== 'all') {
          query = query.eq('level', logLevel);
        }

        const from = page * LOGS_PER_PAGE;
        const to = from + LOGS_PER_PAGE - 1;

        query = query.order('created_at', { ascending: false }).range(from, to);

        const { data, error, count } = await query;

        if (error) {
          throw error;
        }

        setLogs(data);
        setTotalCount(count);
      } catch (error) {
        toast({
          title: t('logs.loadError'),
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [debouncedSearchTerm, logLevel, page, toast, t]);

  const levelVariantMap = {
    info: 'info',
    warning: 'warning',
    error: 'destructive',
  };

  const totalPages = Math.ceil(totalCount / LOGS_PER_PAGE);
  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  return (
    <>
      <Helmet>
        <title>{t('logs.title')}</title>
        <meta name="description" content="Journal des activités de la plateforme." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold tracking-tight">{t('logs.heading')}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('logs.filters')}</CardTitle>
            <div className="flex items-center space-x-4 pt-4">
              <Input
                placeholder={t('logs.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('logs.levelPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('logs.levels.all')}</SelectItem>
                  <SelectItem value="info">{t('logs.levels.info')}</SelectItem>
                  <SelectItem value="warning">{t('logs.levels.warning')}</SelectItem>
                  <SelectItem value="error">{t('logs.levels.error')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center p-10">{t('logs.loading')}</div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">{t('logs.table.level')}</TableHead>
                        <TableHead>{t('logs.table.message')}</TableHead>
                        <TableHead className="w-[250px]">{t('logs.table.date')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.length > 0 ? (
                        logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge variant={levelVariantMap[log.level] || 'default'}>
                                {log.level}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.message}</TableCell>
                            <TableCell>
                              {format(new Date(log.created_at), "d MMMM yyyy 'à' HH:mm:ss", { locale: dateLocale })}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            {t('logs.noLogs')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 0}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm">
                    Page {page + 1} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page + 1 >= totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AdminLogsPage;