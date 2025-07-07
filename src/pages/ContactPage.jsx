
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Textarea } from '@/components/ui/textarea';

const ContactPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        });

      if (error) throw error;
      
      toast({
        title: "✅ Message envoyé !",
        description: "Merci de nous avoir contactés. Nous reviendrons vers vous bientôt.",
      });
      setFormData({ name: '', email: '', message: '' });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Une erreur est survenue",
        description: "Votre message n'a pas pu être envoyé. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <Helmet>
        <title>Contact - WIIBEC</title>
        <meta name="description" content="Contactez l'équipe de WIIBEC." />
      </Helmet>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Contactez-Nous</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Une question, une proposition de partenariat ? Nous sommes à votre écoute.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Envoyer un message</CardTitle>
            <CardDescription>Remplissez ce formulaire pour nous joindre.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input type="text" id="name" required placeholder="Votre nom complet" value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" required placeholder="votre.email@example.com" value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows="5" required placeholder="Votre message..." value={formData.message} onChange={handleChange} />
              </div>
              <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground font-bold" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Envoi..." : "Envoyer le Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ContactPage;
