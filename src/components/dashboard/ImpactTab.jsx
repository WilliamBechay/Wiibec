
import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
};

const ImpactTab = ({ stats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre impact sur WIIBEC</CardTitle>
        <CardDescription>
          Découvrez comment vos donations contribuent à notre mission
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-secondary rounded-lg">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {Math.floor(stats.totalDonated / 10)}
            </h3>
            <p className="text-muted-foreground">Jeunes formés grâce à vous</p>
          </div>
          <div className="text-center p-6 bg-secondary rounded-lg">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {Math.floor(stats.totalDonated / 25)}
            </h3>
            <p className="text-muted-foreground">Programmes financés</p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <p className="text-primary text-center">
            <strong>Merci !</strong> Vos {formatCurrency(stats.totalDonated)} de donations 
            ont un impact direct sur l'éducation financière des jeunes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactTab;
