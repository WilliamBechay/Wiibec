import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const DonationsTab = ({ donations, loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des donations</CardTitle>
        <CardDescription>
          Toutes vos contributions à l'éducation financière des jeunes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : donations.length > 0 ? (
          <div className="space-y-4">
            {donations.map((donation, index) => (
              <div
                key={donation.id}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Donation #{donations.length - index}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(donation.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {formatCurrency(donation.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {donation.payment_method}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucune donation pour le moment
            </h3>
            <p className="text-muted-foreground mb-4">
              Commencez à soutenir l'éducation financière des jeunes
            </p>
            <Link to="/donate">
              <Button className="bg-primary text-primary-foreground">
                Faire un don
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DonationsTab;