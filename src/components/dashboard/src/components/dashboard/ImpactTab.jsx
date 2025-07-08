import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Briefcase, School, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const icons = {
  Users,
  BookOpen,
  Briefcase,
  School,
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
};

const ImpactCard = ({ iconName, name, description, cost, totalDonated }) => {
  const Icon = icons[iconName] || Users;
  const unitsAchieved = Math.floor(totalDonated / cost);
  const progressToNextUnit = (totalDonated % cost) / cost * 100;
  const remainingForNext = cost - (totalDonated % cost);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="flex flex-col h-full"
    >
      <Card className="flex-grow">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{unitsAchieved}</p>
            <p className="text-sm text-muted-foreground">unités financées grâce à vous</p>
          </div>
          <div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-muted-foreground">Progression vers la prochaine unité</span>
              <span className="font-semibold text-foreground">{progressToNextUnit.toFixed(0)}%</span>
            </div>
            <Progress value={progressToNextUnit} />
            <p className="text-xs text-center text-muted-foreground mt-2">
              Plus que <span className="font-bold text-primary">{formatCurrency(remainingForNext)}</span> pour financer la prochaine unité !
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ImpactTab = ({ stats }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('impact_metrics')
          .select('*')
          .eq('is_active', true)
          .order('cost_per_unit', { ascending: true });
        
        if (error) throw error;
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching impact metrics:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données d'impact.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre impact sur WIIBEC</CardTitle>
        <CardDescription>
          Découvrez comment vos donations contribuent à notre mission, palier par palier.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {metrics.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {metrics.map(metric => (
              <ImpactCard
                key={metric.id}
                iconName={metric.icon_name}
                name={metric.name}
                description={metric.description}
                cost={Number(metric.cost_per_unit)}
                totalDonated={stats.totalDonated}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-10">
            <p>Les informations sur l'impact ne sont pas disponibles pour le moment.</p>
          </div>
        )}
        <div className="mt-8 p-4 bg-primary/10 rounded-lg">
          <p className="text-primary text-center text-lg">
            Au total, vos <strong className="font-bold">{formatCurrency(stats.totalDonated)}</strong> de donations 
            ont un impact direct et mesurable sur l'éducation financière des jeunes. <strong>Merci !</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactTab;