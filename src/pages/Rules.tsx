import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { ChevronRight, ChevronDown, Search, BookOpen } from 'lucide-react';

// Tree structure for rules navigation
const rulesStructure = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: 'BookOpen',
    children: [
      { id: 'what-is-dnd', title: 'What is D&D?' },
      { id: 'how-to-play', title: 'How to Play' },
      { id: 'dice', title: 'Using Dice' },
      { id: 'ability-scores', title: 'Ability Scores' },
    ]
  },
  {
    id: 'character-creation',
    title: 'Character Creation',
    icon: 'User',
    children: [
      { id: 'races', title: 'Races' },
      { id: 'classes', title: 'Classes' },
      { id: 'backgrounds', title: 'Backgrounds' },
      { id: 'equipment', title: 'Equipment' },
    ]
  },
  {
    id: 'playing-the-game',
    title: 'Playing the Game',
    icon: 'Swords',
    children: [
      { id: 'ability-checks', title: 'Ability Checks' },
      { id: 'saving-throws', title: 'Saving Throws' },
      { id: 'advantage-disadvantage', title: 'Advantage & Disadvantage' },
      { id: 'combat', title: 'Combat' },
      { id: 'conditions', title: 'Conditions' },
    ]
  },
  {
    id: 'spellcasting',
    title: 'Spellcasting',
    icon: 'Sparkles',
    children: [
      { id: 'spellcasting-basics', title: 'Spellcasting Basics' },
      { id: 'spell-slots', title: 'Spell Slots' },
      { id: 'preparing-spells', title: 'Preparing Spells' },
      { id: 'casting-spells', title: 'Casting Spells' },
    ]
  },
  {
    id: 'adventuring',
    title: 'Adventuring',
    icon: 'Map',
    children: [
      { id: 'time', title: 'Time' },
      { id: 'movement', title: 'Movement' },
      { id: 'environment', title: 'The Environment' },
      { id: 'social-interaction', title: 'Social Interaction' },
      { id: 'resting', title: 'Resting' },
    ]
  }
];

const sampleRuleContent = `
# What is D&D?

Dungeons & Dragons (D&D) is a fantasy tabletop role-playing game first published in 1974. The game has been published by Wizards of the Coast since 1997. It was derived from miniature wargames, with a variation of the 1971 game Chainmail serving as the initial rule system.

## The Core of D&D

At its heart, D&D is a game about storytelling in worlds of swords and sorcery. Like games of make-believe, D&D is driven by imagination. It's about picturing a crumbling castle in a darkening forest and imagining how a fantasy adventurer might react to the challenges that scene presents.

## Three Pillars of Adventure

Adventurers can try to do anything their players can imagine, but it can be helpful to talk about their activities in three broad categories: exploration, social interaction, and combat.

- **Exploration** includes both the adventurers' movement through the world and their interaction with objects and situations that require their attention.
- **Social interaction** features the adventurers talking to someone (or something) else.
- **Combat** involves characters and other creatures swinging weapons, casting spells, maneuvering for position, and so on—all in an effort to defeat their opponents.

## Worlds of Adventure

The worlds of the Dungeons & Dragons game exist within a vast cosmos called the multiverse, connected by a mysterious force called the Weave.

Within this multiverse are an endless variety of worlds. Many of them have been published as official campaign settings for the D&D game, including:

- **Forgotten Realms**
- **Greyhawk**
- **Dragonlance**
- **Ravenloft**
- **Eberron**
- **Mystara**
- **Birthright**
- **Dark Sun**

## How to Play

1. **The DM describes the environment**
2. **The players describe what they want to do**
3. **The DM narrates the results of their actions**

This three-part pattern repeats throughout the game, whether the adventurers are cautiously exploring a ruin, talking to a devious prince, or locked in mortal combat against a mighty dragon.
`;

export const Rules: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);
  const [selectedRule, setSelectedRule] = useState<string>('what-is-dnd');
  const [searchTerm, setSearchTerm] = useState('');
  const [ruleContent, setRuleContent] = useState(sampleRuleContent);
  const { playSound } = useAudio();

  useEffect(() => {
    // Simulate fetching a specific rule when selectedRule changes
    // In a real application, this would fetch actual content from a database or API
    // For this demo, we're just using the sample content
    
    // Scroll to top of content area
    const contentArea = document.getElementById('rule-content');
    if (contentArea) {
      contentArea.scrollTop = 0;
    }
    
    playSound('pageChange');
  }, [selectedRule, playSound]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
    playSound('click');
  };

  const selectRule = (ruleId: string) => {
    setSelectedRule(ruleId);
  };

  // Filter rules based on search term
  const filterRules = () => {
    if (!searchTerm.trim()) return rulesStructure;
    
    return rulesStructure.map(section => {
      const filteredChildren = section.children.filter(rule => 
        rule.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredChildren.length > 0) {
        return {
          ...section,
          children: filteredChildren
        };
      }
      return null;
    }).filter(Boolean) as typeof rulesStructure;
  };

  const filteredRules = filterRules();

  // Convert markdown-style content to React components
  const renderRuleContent = (content: string) => {
    const lines = content.split('\n');
    const renderedContent: JSX.Element[] = [];
    
    let inList = false;
    let listItems: string[] = [];
    
    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        if (inList) {
          renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-6 mb-4">{listItems.map((item, i) => <li key={i}>{item}</li>)}</ul>);
          inList = false;
          listItems = [];
        }
        renderedContent.push(<h1 key={index} className="text-3xl font-bold mb-4">{line.substring(2)}</h1>);
      }
      else if (line.startsWith('## ')) {
        if (inList) {
          renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-6 mb-4">{listItems.map((item, i) => <li key={i}>{item}</li>)}</ul>);
          inList = false;
          listItems = [];
        }
        renderedContent.push(<h2 key={index} className="text-2xl font-bold mt-6 mb-3">{line.substring(3)}</h2>);
      }
      // List items
      else if (line.startsWith('- ')) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(line.substring(2));
      }
      // Regular paragraphs
      else if (line.trim() !== '') {
        if (inList) {
          renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-6 mb-4">{listItems.map((item, i) => <li key={i}>{item}</li>)}</ul>);
          inList = false;
          listItems = [];
        }
        renderedContent.push(<p key={index} className="mb-4 leading-relaxed">{line}</p>);
      }
    });
    
    // Handle any remaining list items
    if (inList) {
      renderedContent.push(<ul key="list-final" className="list-disc pl-6 mb-4">{listItems.map((item, i) => <li key={i}>{item}</li>)}</ul>);
    }
    
    return renderedContent;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="magical-card p-6"
      >
        <h1 className="text-3xl font-bold mb-6 text-center glow-text">D&D 5e Rules Compendium</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Rules Navigation */}
          <div className="w-full md:w-80 flex-shrink-0">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search rules..."
                  className="bg-muted/50 w-full py-2 pl-10 pr-4 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
              {filteredRules.map(section => (
                <div key={section.id} className="mb-2">
                  <button
                    className="flex items-center justify-between w-full text-left py-2 px-3 hover:bg-primary/10 rounded-md transition-colors"
                    onClick={() => toggleSection(section.id)}
                  >
                    <span className="font-bold">{section.title}</span>
                    {expandedSections.includes(section.id) ? 
                      <ChevronDown size={18} /> : 
                      <ChevronRight size={18} />
                    }
                  </button>
                  
                  {expandedSections.includes(section.id) && (
                    <div className="ml-4 mt-1 border-l-2 border-primary/20 pl-3">
                      {section.children.map(rule => (
                        <button
                          key={rule.id}
                          className={`w-full text-left py-1.5 px-2 my-0.5 rounded-md transition-colors hover:bg-primary/10 ${
                            selectedRule === rule.id ? 'bg-primary/20 text-accent' : ''
                          }`}
                          onClick={() => selectRule(rule.id)}
                        >
                          {rule.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filteredRules.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">No rules found matching "{searchTerm}"</p>
              )}
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-grow">
            <div 
              id="rule-content"
              className="parchment-bg p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-200px)] prose prose-sm sm:prose-base"
            >
              {renderRuleContent(ruleContent)}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};