import React, { useState, useEffect, useMemo } from 'react';
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
import { fr } from 'date-fns/locale';

const LOGS_PER_PAGE = 15;

const AdminLogsPage = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
        title: 'Erreur de chargement des logs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [debouncedSearchTerm, logLevel, page, toast]);

  const levelVariantMap = {
    info: 'info',
    warning: 'warning',
    error: 'destructive',
  };

  const totalPages = Math.ceil(totalCount / LOGS_PER_PAGE);

  return (
    <>
      <Helmet>
        <title>Logs - Administration</title>
        <meta name="description" content="Journal des activités de la plateforme." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold tracking-tight">Journaux d'activité</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
            <div className="flex items-center space-x-4 pt-4">
              <Input
                placeholder="Rechercher dans les messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Niveau de log" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center p-10">Chargement des logs...</div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Niveau</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="w-[250px]">Date</TableHead>
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
                              {format(new Date(log.created_at), "d MMMM yyyy 'à' HH:mm:ss", { locale: fr })}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            Aucun log trouvé.
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