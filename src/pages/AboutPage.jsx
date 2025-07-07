import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

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

const AboutPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Helmet>
        <title>À propos - WIIBEC</title>
        <meta name="description" content="Découvrez WIIBEC, notre mission d'éducation financière des jeunes, notre équipe passionnée et notre impact sur la communauté." />
      </Helmet>

      <div className="space-y-24">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6"
            >
              <h1 className="text-5xl md:text-6xl font-bold">
                À propos de <span className="text-primary">WIIBEC</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Wiibec est une organisation à but non lucratif qui œuvre pour l’éducation financière des jeunes. Nous intervenons directement dans les établissements scolaires pour transmettre les bases essentielles de la gestion de l’argent.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-secondary/50 rounded-lg">
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
      </div>
    </motion.div>
  );
};

export default AboutPage;