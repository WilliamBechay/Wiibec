import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Loader2, GraduationCap, CheckCircle, HeartHandshake as Handshake, Award, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DonationGoal from '@/components/DonationGoal';

const FAQItem = ({ question, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
    className="bg-card p-6 rounded-lg"
  >
    <h3 className="text-xl font-bold text-primary mb-3">{question}</h3>
    <div className="text-muted-foreground space-y-4">{children}</div>
  </motion.div>
);

const HomePage = () => {
  const { user, loading } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      variants={containerVariants}
    >
      <Helmet>
        <title>WIIBEC - Éducation Financière des Jeunes</title>
        <meta name="description" content="WIIBEC est une ONG dédiée à l'éducation financière des jeunes. Rejoignez-nous pour construire un avenir financier solide." />
      </Helmet>

      <section className="text-center py-16 md:py-28">
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-foreground leading-tight tracking-tighter"
        >
          Forger l'Avenir par
          <br />
          <span className="text-primary">l'Éducation Financière</span>
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-md sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-6 mb-10"
        >
          Wiibec est une organisation à but non lucratif qui œuvre pour l’éducation financière des jeunes. Nous intervenons directement dans les établissements scolaires pour transmettre les bases essentielles de la gestion de l’argent.
        </motion.p>
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/donate">
            <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-transform hover:scale-105">
              Faire un don <Heart className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="#about-us">
            <Button size="lg" variant="outline" className="w-full sm:w-auto transition-transform hover:scale-105">
              En savoir plus <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
          <a href="https://mindovest.com" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto transition-transform hover:scale-105">
              Partenaire Éducatif <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </motion.div>
      </section>
      
      <DonationGoal />

      <section id="about-us" className="py-20 bg-secondary/50 rounded-lg">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              <FAQItem question="Qui êtes-vous ?">
                <p>Wiibec est une organisation à but non lucratif qui œuvre pour l’éducation financière des jeunes. Nous intervenons directement dans les établissements scolaires pour transmettre les bases essentielles de la gestion de l’argent.</p>
              </FAQItem>

              <FAQItem question="Quelle est votre mission ?">
                <p>Notre mission est simple : éduquer financièrement les jeunes afin qu’ils sachent quoi faire à la fin de leurs études. Nous voulons leur donner les outils pour prendre des décisions financières éclairées dès le début de leur vie adulte.</p>
              </FAQItem>

              <FAQItem question="Pourquoi l’éducation financière est-elle si importante ?">
                <p>Parce que les jeunes quittent souvent l’école sans aucune connaissance concrète sur :</p>
                <ul className="space-y-2 pl-5">
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>Comment gérer un budget</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>Ce qu’est un crédit ou une épargne</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>Comment éviter les dettes ou les arnaques</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>Les premières décisions financières à prendre</span></li>
                </ul>
                <p className="font-semibold text-foreground">Une bonne éducation financière, c’est une vie plus stable et plus autonome.</p>
              </FAQItem>

              <FAQItem question="À qui s’adressent vos actions ?">
                <p>Nos actions sont spécifiquement destinées aux jeunes, principalement au secondaire. Nous intervenons en partenariat avec les établissements scolaires qui souhaitent intégrer nos modules à leur programme pédagogique.</p>
              </FAQItem>
              
              <FAQItem question="Que proposez-vous concrètement ?">
                <p>Nous proposons :</p>
                <ul className="space-y-2 pl-5">
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>Des formations pratiques directement en classe</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>Des ateliers ludiques et interactifs</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>Des interventions adaptées à l’âge des élèves</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>Des outils pédagogiques remis aux élèves</span></li>
                </ul>
              </FAQItem>

              <FAQItem question="Qui anime les formations ?">
                <p>Nos sessions sont animées par des conseillers financiers certifiés qui travaillent dans des établissements bancaires. Ces professionnels bénévoles partagent leur expertise de manière neutre, accessible et adaptée aux jeunes.</p>
              </FAQItem>
              
              <FAQItem question="Est-ce que c’est gratuit ?">
                <p>Oui. Toutes nos interventions sont entièrement gratuites pour les établissements scolaires et les élèves.</p>
                <p className="font-semibold text-foreground mt-4">Wiibec est financée par :</p>
                 <ul className="space-y-2 pl-5">
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>Des dons de particuliers</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>Des partenariats d'entreprises</span></li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" /><span>Des subventions publiques ou privées</span></li>
                </ul>
              </FAQItem>
            </div>
          </div>
        </section>

        <section id="certificate" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-5xl font-extrabold text-foreground mb-4"
            >
              Notre Statut Officiel
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12"
            >
              WIIBEC est une organisation à but non lucratif enregistrée auprès du gouvernement du Canada. Voici notre certificat de constitution, gage de notre transparence et de notre engagement.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="max-w-lg mx-auto bg-card p-2 rounded-2xl shadow-2xl border border-border"
            >
              <img
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/9df2d7b2-f84d-4320-86bd-d7ae1541ec09/abf9e1e9c78f4096e15af4fb812454f7.webp"
                alt="Certificat de constitution de WIIBEC"
                className="rounded-xl w-full"
              />
            </motion.div>
          </div>
        </section>
    </motion.div>
  );
};

export default HomePage;