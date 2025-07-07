import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const ReportInvoiceIssueDialog = ({ open, onOpenChange, invoice }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez décrire le problème.',
      });
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.from('contact_messages').insert({
        invoice_id: invoice.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: user.email,
        subject: `Problème avec la facture #${invoice.invoice_number}`,
        message: description,
      });

      if (error) throw error;

      toast({
        title: 'Demande envoyée',
        description: 'Nous avons bien reçu votre signalement et nous le traiterons dans les plus brefs délais.',
      });
      onOpenChange(false);
      setDescription('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Signaler un problème</DialogTitle>
            <DialogDescription>
              Décrivez le problème que vous rencontrez avec la facture #{invoice?.invoice_number}. Votre message sera envoyé à notre équipe de support.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="description">Description du problème</Label>
              <Textarea
                id="description"
                placeholder="Ex: L'adresse sur la facture est incorrecte..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Envoyer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportInvoiceIssueDialog;