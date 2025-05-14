import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { Search, Filter, Sparkles, X, BookOpen } from 'lucide-react';

interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  classes: string[];
  description: string;
}

// Sample spell data for demonstration
const sampleSpells: Spell[] = [
  {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: 'V, S, M (a tiny ball of bat guano and sulfur)',
    duration: 'Instantaneous',
    classes: ['Sorcerer', 'Wizard'],
    description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one. The fire spreads around corners. It ignites flammable objects in the area that aren\'t being worn or carried.'
  },
  {
    id: 'cure-wounds',
    name: 'Cure Wounds',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'],
    description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.'
  },
  {
    id: 'magic-missile',
    name: 'Magic Missile',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    classes: ['Sorcerer', 'Wizard'],
    description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.'
  },
  {
    id: 'detect-magic',
    name: 'Detect Magic',
    level: 1,
    school: 'Divination',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: 'Concentration, up to 10 minutes',
    classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Wizard'],
    description: 'For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any.'
  },
  {
    id: 'shield',
    name: 'Shield',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 reaction',
    range: 'Self',
    components: 'V, S',
    duration: '1 round',
    classes: ['Sorcerer', 'Wizard'],
    description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.'
  },
  {
    id: 'wish',
    name: 'Wish',
    level: 9,
    school: 'Conjuration',
    castingTime: '1 action',
    range: 'Self',
    components: 'V',
    duration: 'Instantaneous',
    classes: ['Sorcerer', 'Wizard'],
    description: 'Wish is the mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality in accord with your desires.'
  }
];

export const SpellDatabase: React.FC = () => {
  const [spells, setSpells] = useState<Spell[]>(sampleSpells);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [filters, setFilters] = useState({
    level: 'all',
    school: 'all',
    class: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const { playSound } = useAudio();
  
  // List of all possible spell schools
  const spellSchools = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'];
  
  // List of all possible classes
  const spellClasses = ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'];
  
  const handleSpellClick = (spell: Spell) => {
    setSelectedSpell(spell);
    playSound('spellCast');
  };
  
  const clearSelectedSpell = () => {
    setSelectedSpell(null);
    playSound('click');
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
    playSound('click');
  };
  
  // Filter spells based on search term and filters
  const filteredSpells = spells.filter(spell => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          spell.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filters.level === 'all' || spell.level.toString() === filters.level;
    const matchesSchool = filters.school === 'all' || spell.school === filters.school;
    const matchesClass = filters.class === 'all' || spell.classes.includes(filters.class);
    
    return matchesSearch && matchesLevel && matchesSchool && matchesClass;
  });
  
  const getSpellLevelText = (level: number) => {
    if (level === 0) return 'Cantrip';
    if (level === 1) return '1st Level';
    if (level === 2) return '2nd Level';
    if (level === 3) return '3rd Level';
    return `${level}th Level`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="magical-card p-6"
      >
        <h1 className="text-3xl font-bold text-center mb-6 glow-text">Spell Database</h1>
        
        {/* Search and Filter Controls */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search spells by name or description..."
                className="w-full bg-muted/50 py-2 pl-10 pr-4 rounded-lg"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-primary text-white' : 'bg-muted/50 hover:bg-muted'
              }`}
              onClick={toggleFilters}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Filter Options */}
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-muted/30 p-4 rounded-lg mb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 font-bold">Spell Level</label>
                  <select
                    name="level"
                    value={filters.level}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-background/70 rounded-md"
                  >
                    <option value="all">All Levels</option>
                    <option value="0">Cantrip</option>
                    <option value="1">1st Level</option>
                    <option value="2">2nd Level</option>
                    <option value="3">3rd Level</option>
                    <option value="4">4th Level</option>
                    <option value="5">5th Level</option>
                    <option value="6">6th Level</option>
                    <option value="7">7th Level</option>
                    <option value="8">8th Level</option>
                    <option value="9">9th Level</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 font-bold">School of Magic</label>
                  <select
                    name="school"
                    value={filters.school}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-background/70 rounded-md"
                  >
                    <option value="all">All Schools</option>
                    {spellSchools.map(school => (
                      <option key={school} value={school}>{school}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 font-bold">Class</label>
                  <select
                    name="class"
                    value={filters.class}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-background/70 rounded-md"
                  >
                    <option value="all">All Classes</option>
                    {spellClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row md:space-x-6">
          {/* Spell List */}
          <div className={`w-full ${selectedSpell ? 'md:w-1/2' : ''} mb-6 md:mb-0`}>
            <h2 className="text-xl font-bold mb-3 flex items-center">
              <BookOpen size={20} className="mr-2 text-accent" />
              <span>Spells ({filteredSpells.length})</span>
            </h2>
            
            {filteredSpells.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpells.map(spell => (
                  <motion.div
                    key={spell.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`magical-card p-4 cursor-pointer hover:ring-1 hover:ring-primary transition-all ${
                      selectedSpell?.id === spell.id ? 'ring-2 ring-accent' : ''
                    }`}
                    onClick={() => handleSpellClick(spell)}
                  >
                    <h3 className="font-bold text-lg">{spell.name}</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-foreground/70">{getSpellLevelText(spell.level)}</span>
                      <span className="text-xs px-2 py-0.5 bg-primary/20 rounded-full">{spell.school}</span>
                    </div>
                    <p className="text-sm text-foreground/70 truncate">{spell.description.substring(0, 60)}...</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {spell.classes.slice(0, 3).map(cls => (
                        <span key={cls} className="text-xs px-1.5 py-0.5 bg-secondary/20 rounded-full">
                          {cls}
                        </span>
                      ))}
                      {spell.classes.length > 3 && (
                        <span className="text-xs px-1.5 py-0.5 bg-secondary/20 rounded-full">
                          +{spell.classes.length - 3}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-muted/20 rounded-lg">
                <Sparkles size={40} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-foreground/70">No spells found matching your search criteria.</p>
              </div>
            )}
          </div>
          
          {/* Spell Details */}
          {selectedSpell && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-1/2"
            >
              <div className="magical-card p-6 relative">
                <button
                  className="absolute top-3 right-3 p-1 rounded-full bg-muted hover:bg-muted/70 transition-colors md:hidden"
                  onClick={clearSelectedSpell}
                >
                  <X size={18} />
                </button>
                
                <div className="mb-4 flex items-center">
                  <Sparkles size={24} className="text-accent mr-3" />
                  <h2 className="text-2xl font-bold">{selectedSpell.name}</h2>
                </div>
                
                <div className="mb-4 pb-4 border-b border-primary/20">
                  <p className="font-semibold text-accent">{getSpellLevelText(selectedSpell.level)} • {selectedSpell.school}</p>
                </div>
                
                <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <p className="text-sm text-foreground/70">Casting Time</p>
                    <p className="font-medium">{selectedSpell.castingTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Range</p>
                    <p className="font-medium">{selectedSpell.range}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Components</p>
                    <p className="font-medium">{selectedSpell.components}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Duration</p>
                    <p className="font-medium">{selectedSpell.duration}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-foreground/70 mb-1">Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpell.classes.map(cls => (
                      <span key={cls} className="px-2 py-1 bg-secondary/20 rounded-full text-sm">
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Description</p>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <p>{selectedSpell.description}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-primary/20">
                  <p className="text-sm text-foreground/70">
                    <span className="font-semibold">At Higher Levels: </span>
                    When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};