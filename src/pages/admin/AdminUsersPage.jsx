import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit, UserX, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import UserEditDialog from '@/components/admin/UserEditDialog';
import AddUserDialog from '@/components/admin/AddUserDialog';
import { useTranslation } from 'react-i18next';

const AdminUsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });
  const { t } = useTranslation('admin');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const from = pagination.page * pagination.pageSize;
      const to = from + pagination.pageSize - 1;

      let query = supabase
        .from('users_with_profiles')
        .select(`*`, { count: 'exact' });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      setUsers(data || []);
      setPagination(prev => ({ ...prev, total: count || 0 }));

    } catch (error) {
      toast({ title: t('common:errors.error'), description: t('users.toast.loadError', { error: error.message }), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, pagination.page, pagination.pageSize, searchTerm, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleSaveUser = async (userId, updatedData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updatedData.first_name,
          last_name: updatedData.last_name,
          is_admin: updatedData.is_admin,
        })
        .eq('id', userId);

      if (error) throw error;

      toast({ title: t('auth:resetPasswordPage.successToastTitle'), description: t('users.toast.updateSuccess') });
      fetchUsers();
    } catch (error) {
      toast({ title: t('common:errors.error'), description: t('users.toast.updateError', { error: error.message }), variant: "destructive" });
    }
  };

  const handleAddUser = async (newUserData) => {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUserData.email,
        password: newUserData.password,
        email_confirm: true,
        user_metadata: {
          first_name: newUserData.first_name,
          last_name: newUserData.last_name,
        }
      });
      if (error) throw error;
      
      if(newUserData.is_admin) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', data.user.id);
        if (profileError) throw profileError;
      }

      toast({ title: t('auth:resetPasswordPage.successToastTitle'), description: t('users.toast.addSuccess') });
      fetchUsers();
    } catch (error) {
       toast({ title: t('common:errors.error'), description: t('users.toast.addError', { error: error.message }), variant: "destructive" });
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const { error } = await supabase.auth.admin.deleteUser(selectedUser.id);
      if (error) throw error;
      
      toast({ title: t('auth:resetPasswordPage.successToastTitle'), description: t('users.toast.deleteSuccess') });
      fetchUsers();
    } catch (error) {
      toast({ title: t('common:errors.error'), description: t('users.toast.deleteError', { error: error.message }), variant: "destructive" });
    } finally {
      setIsDeleteOpen(false);
      setSelectedUser(null);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination(p => ({ ...p, page: 0 }));
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <>
      <Helmet>
        <title>{t('users.title')}</title>
        <meta name="description" content="Gestion des utilisateurs de la plateforme." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between space-x-4">
          <h1 className="text-3xl font-bold tracking-tight">{t('users.heading')}</h1>
          <Button onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('users.addUser')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('users.listTitle')}</CardTitle>
            <CardDescription>
              {t('users.listDescription', { total: pagination.total })}
            </CardDescription>
             <div className="relative pt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('users.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8 w-full md:w-1/3"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('users.table.name')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('users.table.email')}</TableHead>
                    <TableHead>{t('users.table.role')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('users.table.registeredDate')}</TableHead>
                    <TableHead><span className="sr-only">{t('users.table.actions')}</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {t('users.loading')}
                      </TableCell>
                    </TableRow>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                        <TableCell>{user.is_admin ? t('users.roleAdmin') : t('users.roleUser')}</TableCell>
                        <TableCell className="hidden sm:table-cell">{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{t('users.actionsMenu.open')}</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t('users.actionsMenu.title')}</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('users.actionsMenu.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(user)} className="text-red-600 focus:text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                {t('users.actionsMenu.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {t('users.noUsers')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <span className="text-sm text-muted-foreground">
                Page {pagination.page + 1} sur {totalPages > 0 ? totalPages : 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(p => ({...p, page: p.page - 1}))}
                disabled={pagination.page === 0}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(p => ({...p, page: p.page + 1}))}
                disabled={pagination.page >= totalPages - 1}
              >
                Suivant
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {selectedUser && (
        <UserEditDialog
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={selectedUser}
          onSave={handleSaveUser}
        />
      )}

      <AddUserDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddUser}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.deleteDialog.description', { name: `${selectedUser?.first_name} ${selectedUser?.last_name}`, email: selectedUser?.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>{t('users.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('users.deleteDialog.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminUsersPage;