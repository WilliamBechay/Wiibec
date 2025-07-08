import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const DonationPromptCard = () => {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
          <Heart className="w-6 h-6 mr-3" />
          Soutenez notre cause
        </CardTitle>
        <CardDescription>
          Chaque don, petit ou grand, nous aide à poursuivre notre mission d'éducation financière pour les jeunes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link to="/donate">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg">
            Faire un don maintenant
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default DonationPromptCard;