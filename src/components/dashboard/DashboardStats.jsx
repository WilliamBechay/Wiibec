
import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Heart, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
};

const getRankColor = (rank) => {
  switch (rank) {
    case 'Platine': return 'text-purple-400';
    case 'Or': return 'text-yellow-400';
    case 'Argent': return 'text-slate-400';
    default: return 'text-amber-600';
  }
};

const StatCard = ({ title, value, icon: Icon, description, colorClass }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${colorClass || ''}`}>{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const DashboardStats = ({ stats, userCreatedAt }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <StatCard
        title="Total des dons"
        value={formatCurrency(stats.totalDonated)}
        icon={DollarSign}
        description="Merci pour votre générosité"
      />
      <StatCard
        title="Nombre de dons"
        value={stats.donationCount}
        icon={Heart}
        description="Donations effectuées"
      />
      <StatCard
        title="Rang donateur"
        value={stats.rank}
        icon={Award}
        description="Votre niveau de contribution"
        colorClass={getRankColor(stats.rank)}
      />
      <StatCard
        title="Membre depuis"
        value={new Date(userCreatedAt).getFullYear()}
        icon={Calendar}
        description="Année d'inscription"
      />
    </motion.div>
  );
};

export default DashboardStats;
