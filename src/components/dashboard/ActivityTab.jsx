
import React from 'react';
import { Heart, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const ActivityTab = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>
          Vos dernières actions sur la plateforme WIIBEC
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 bg-secondary rounded-lg"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                {activity.type === 'donation' ? (
                  <Heart className="w-5 h-5 text-primary" />
                ) : (
                  <Users className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{activity.message}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(activity.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityTab;
