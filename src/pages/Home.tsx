import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { Dice1 as DiceD20, Scroll, BookUser, Sparkles, Skull, Map } from 'lucide-react';

export const Home: React.FC = () => {
  const { playSound } = useAudio();

  const handleCardClick = () => {
    playSound('click');
  };

  const features = [
    {
      path: '/rules',
      title: 'Rules Compendium',
      description: 'Access the entire SRD/Basic rules with intuitive navigation.',
      icon: <Scroll size={40} className="text-primary" />,
      color: 'primary',
    },
    {
      path: '/dice-roller',
      title: 'Interactive Dice Roller',
      description: 'Roll 3D dice with physics and save common roll configurations.',
      icon: <DiceD20 size={40} className="text-secondary" />,
      color: 'secondary',
    },
    {
      path: '/character-builder',
      title: 'Character Builder',
      description: 'Create and manage characters with guided steps and randomization.',
      icon: <BookUser size={40} className="text-success" />,
      color: 'success',
    },
    {
      path: '/spells',
      title: 'Spell Database',
      description: 'Search and filter through all spells in the SRD.',
      icon: <Sparkles size={40} className="text-accent" />,
      color: 'accent',
    },
    {
      path: '/monsters',
      title: 'Monster Compendium',
      description: 'Browse monsters with sorting by CR, type, and habitat.',
      icon: <Skull size={40} className="text-error" />,
      color: 'error',
    },
    {
      path: '/campaigns',
      title: 'Campaign Manager',
      description: 'Plan and track your campaigns and adventures.',
      icon: <Map size={40} className="text-warning" />,
      color: 'warning',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="mb-12">
        <motion.div 
          className="magical-card p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.h1 
            className="text-3xl md:text-5xl font-bold mb-4 glow-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Welcome to the Arcane Compendium
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-foreground/80 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Your comprehensive resource for all things Dungeons & Dragons 5th Edition.
            Find rules, create characters, roll dice, and manage your campaigns in one place.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            <Link 
              to="/character-builder" 
              className="bg-primary hover:bg-primary/80 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/50"
              onClick={handleCardClick}
            >
              Create Character
            </Link>
            <Link 
              to="/dice-roller" 
              className="bg-secondary hover:bg-secondary/80 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-secondary/50"
              onClick={handleCardClick}
            >
              Roll Dice
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center glow-text">Explore Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <Link 
                to={feature.path}
                className="magical-card block h-full p-6 hover:translate-y-[-5px]"
                onClick={handleCardClick}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className={`mb-4 p-3 rounded-full bg-${feature.color}/10 animate-pulse`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="mb-10">
        <motion.div 
          className="magical-card p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl font-bold mb-4">Ready to Begin Your Adventure?</h2>
          <p className="text-foreground/80 mb-6">
            Whether you're a player or Dungeon Master, our tools will enhance your D&D experience.
          </p>
          <Link 
            to="/rules" 
            className="bg-accent text-accent-foreground font-bold py-2 px-5 rounded-lg hover:bg-accent/80 transition-all duration-300"
            onClick={handleCardClick}
          >
            Begin Your Journey
          </Link>
        </motion.div>
      </section>
    </div>
  );
};