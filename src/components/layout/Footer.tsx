import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background/80 backdrop-blur-lg border-t border-primary/20 py-6 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-foreground/80 text-sm">
              &copy; {new Date().getFullYear()} Arcane Compendium. Fan-made with{' '}
              <Heart className="h-4 w-4 inline text-error" /> for D&D.
            </p>
            <p className="text-foreground/60 text-xs mt-1">
              This site is not affiliated with Wizards of the Coast. System Reference Document content is used under the Open Game License.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
            <Link to="/rules" className="text-foreground/80 hover:text-accent text-sm">
              Rules
            </Link>
            <Link to="/privacy" className="text-foreground/80 hover:text-accent text-sm">
              Privacy Policy
            </Link>
            <a href="#" className="text-foreground/80 hover:text-accent text-sm flex items-center gap-1">
              <Github size={16} />
              <span>GitHub</span>
            </a>
            <a href="#" className="text-foreground/80 hover:text-accent text-sm flex items-center gap-1">
              <Linkedin size={16} />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};