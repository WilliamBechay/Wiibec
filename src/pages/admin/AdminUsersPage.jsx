import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Edit, UserX, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import UserEditDialog from '@/components/admin/UserEditDialog';
import AddUserDialog from '@/components/admin/AddUserDialog';

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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const from = pagination.page * pagination.pageSize;
      const to = from + pagination.pageSize - 1;

      let query = supabase
        .from('profiles')
        .select(`id, first_name, last_name, is_admin, users ( email, created_at )`, { count: 'exact' });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,users(email).ilike.%${searchTerm}%`);
      }
      
      const { data, error, count } = await query
        .order('created_at', { foreignTable: 'users', ascending: false })
        .range(from, to);

      if (error) {
        if (error.message.includes("could not find a relationship")) {
           toast({ title: "Erreur de configuration", description: "La relation entre utilisateurs et profils est introuvable. Veuillez contacter le support.", variant: "destructive" });
        } else {
           throw error;
        }
      }

      setUsers(data || []);
      setPagination(prev => ({ ...prev, total: count || 0 }));

    } catch (error) {
      toast({ title: "Erreur", description: `Impossible de charger les utilisateurs: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, pagination.page, pagination.pageSize, searchTerm]);

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

      toast({ title: "Succès", description: "Profil utilisateur mis à jour." });
      fetchUsers();
    } catch (error) {
      toast({ title: "Erreur", description: `Impossible de mettre à jour le profil: ${error.message}`, variant: "destructive" });
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
      
      // Update role if is_admin is checked
      if(newUserData.is_admin) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', data.user.id);
        if (profileError) throw profileError;
      }

      toast({ title: "Succès", description: "Nouvel utilisateur créé." });
      fetchUsers();
    } catch (error) {
       toast({ title: "Erreur", description: `Impossible de créer l'utilisateur: ${error.message}`, variant: "destructive" });
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
      
      toast({ title: "Succès", description: "L'utilisateur a été supprimé." });
      fetchUsers();
    } catch (error) {
      toast({ title: "Erreur", description: `Impossible de supprimer l'utilisateur: ${error.message}`, variant: "destructive" });
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
        <title>Utilisateurs - Administration</title>
        <meta name="description" content="Gestion des utilisateurs de la plateforme." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between space-x-4">
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <Button onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription>
              {`Total de ${pagination.total} utilisateurs. Consultez, modifiez ou supprimez les profils.`}
            </CardDescription>
             <div className="relative pt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, prénom ou email..."
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
                    <TableHead>Nom</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="hidden sm:table-cell">Date d'inscription</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Chargement des utilisateurs...
                      </TableCell>
                    </TableRow>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.users?.email}</TableCell>
                        <TableCell>{user.is_admin ? 'Admin' : 'Utilisateur'}</TableCell>
                        <TableCell className="hidden sm:table-cell">{formatDate(user.users?.created_at)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(user)} className="text-red-600 focus:text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Aucun utilisateur trouvé.
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
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le compte de {selectedUser?.first_name} {selectedUser?.last_name} ({selectedUser?.users?.email}) et toutes ses données associées seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminUsersPage;