import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Dice1 as DiceD20, Scroll, BookUser, Sparkles, Skull, Map, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAudio } from '../../context/AudioContext';

export const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { playSound } = useAudio();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    playSound('click');
  };

  const handleNavClick = () => {
    playSound('click');
    if (isMenuOpen) setIsMenuOpen(false);
  };

  // Close menu on resize if open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/rules', label: 'Rules', icon: <Scroll size={20} /> },
    { path: '/dice-roller', label: 'Dice Roller', icon: <DiceD20 size={20} /> },
    { path: '/character-builder', label: 'Characters', icon: <BookUser size={20} /> },
    { path: '/spells', label: 'Spells', icon: <Sparkles size={20} /> },
    { path: '/monsters', label: 'Monsters', icon: <Skull size={20} /> },
    { path: '/campaigns', label: 'Campaigns', icon: <Map size={20} /> },
  ];

  return (
    <header className="fixed w-full top-0 z-50">
      <nav className="bg-background/80 backdrop-blur-lg border-b border-primary/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="flex items-center gap-2"
                onClick={handleNavClick}
              >
                <DiceD20 size={28} className="text-accent animate-pulse" />
                <span className="font-serif text-xl font-bold glow-text">Arcane Compendium</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 navbar-item text-foreground/90 hover:text-foreground px-1 py-2 ${
                    location.pathname === item.path ? 'active' : ''
                  }`}
                  onClick={handleNavClick}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-accent focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-background/95 backdrop-blur-lg border-b border-primary/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pt-2 pb-4 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? 'bg-primary/20 text-accent'
                      : 'text-foreground/80 hover:bg-primary/10 hover:text-foreground'
                  }`}
                  onClick={handleNavClick}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
};