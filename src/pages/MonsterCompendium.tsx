import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { Search, Filter, Skull, X, ShieldAlert, Swords, Heart, Zap, Footprints } from 'lucide-react';

interface Monster {
  id: string;
  name: string;
  type: string;
  size: string;
  alignment: string;
  cr: number;
  ac: number;
  hp: number;
  speed: string;
  abilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  habitat: string[];
  description: string;
  traits?: string[];
  actions?: string[];
}

// Sample monster data for demonstration
const sampleMonsters: Monster[] = [
  {
    id: 'goblin',
    name: 'Goblin',
    type: 'Humanoid',
    size: 'Small',
    alignment: 'Neutral Evil',
    cr: 0.25,
    ac: 15,
    hp: 7,
    speed: '30 ft.',
    abilities: {
      str: 8,
      dex: 14,
      con: 10,
      int: 10,
      wis: 8,
      cha: 8
    },
    habitat: ['Forest', 'Hill', 'Mountain', 'Underground'],
    description: 'Goblins are small, black-hearted humanoids that lair in despoiled dungeons and other dismal settings. Individually weak, they gather in large numbers to torment other creatures.',
    traits: ['Nimble Escape: The goblin can take the Disengage or Hide action as a bonus action on each of its turns.'],
    actions: ['Scimitar: Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.', 'Shortbow: Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.']
  },
  {
    id: 'dragon-red-young',
    name: 'Young Red Dragon',
    type: 'Dragon',
    size: 'Large',
    alignment: 'Chaotic Evil',
    cr: 10,
    ac: 18,
    hp: 178,
    speed: '40 ft., climb 40 ft., fly 80 ft.',
    abilities: {
      str: 23,
      dex: 10,
      con: 21,
      int: 14,
      wis: 11,
      cha: 19
    },
    habitat: ['Mountain', 'Hill', 'Volcano'],
    description: 'The most covetous of the true dragons, red dragons tirelessly seek to increase their treasure hoards. They are exceptionally vain, even for dragons, and their conceit is reflected in their proud bearing and their disdain for other creatures.',
    traits: ['Fire Resistance: The dragon has resistance to fire damage.'],
    actions: ['Multiattack: The dragon makes three attacks: one with its bite and two with its claws.', 'Bite: Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage plus 3 (1d6) fire damage.', 'Fire Breath (Recharge 5-6): The dragon exhales fire in a 30-foot cone. Each creature in that area must make a DC 17 Dexterity saving throw, taking 56 (16d6) fire damage on a failed save, or half as much damage on a successful one.']
  },
  {
    id: 'owlbear',
    name: 'Owlbear',
    type: 'Monstrosity',
    size: 'Large',
    alignment: 'Unaligned',
    cr: 3,
    ac: 13,
    hp: 59,
    speed: '40 ft.',
    abilities: {
      str: 20,
      dex: 12,
      con: 17,
      int: 3,
      wis: 12,
      cha: 7
    },
    habitat: ['Forest'],
    description: 'An owlbear\'s screech echoes through dark valleys and spooky forests, piercing the quiet night to announce the death of its prey. Feathers cover the thick, shaggy coat of its bearlike body, and the limpid pupils of its great round eyes stare furiously from its owlish head.',
    traits: ['Keen Sight and Smell: The owlbear has advantage on Wisdom (Perception) checks that rely on sight or smell.'],
    actions: ['Multiattack: The owlbear makes two attacks: one with its beak and one with its claws.', 'Beak: Melee Weapon Attack: +7 to hit, reach 5 ft., one creature. Hit: 10 (1d10 + 5) piercing damage.', 'Claws: Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) slashing damage.']
  },
  {
    id: 'zombie',
    name: 'Zombie',
    type: 'Undead',
    size: 'Medium',
    alignment: 'Neutral Evil',
    cr: 0.25,
    ac: 8,
    hp: 22,
    speed: '20 ft.',
    abilities: {
      str: 13,
      dex: 6,
      con: 16,
      int: 3,
      wis: 6,
      cha: 5
    },
    habitat: ['Urban', 'Ruins', 'Dungeon'],
    description: 'Zombies are the animated corpses of dead humanoids, brought back to a mindless semblance of life through foul magic to serve the evil purposes of their creator.',
    traits: ['Undead Fortitude: If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.'],
    actions: ['Slam: Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage.']
  },
  {
    id: 'ghost',
    name: 'Ghost',
    type: 'Undead',
    size: 'Medium',
    alignment: 'Any',
    cr: 4,
    ac: 11,
    hp: 45,
    speed: '0 ft., fly 40 ft. (hover)',
    abilities: {
      str: 7,
      dex: 13,
      con: 10,
      int: 10,
      wis: 12,
      cha: 17
    },
    habitat: ['Urban', 'Ruins', 'Dungeon', 'Ethereal Plane'],
    description: 'A ghost is the soul of a once-living creature, bound to haunt a specific location, creature, or object that held significance to it in its life.',
    traits: ['Ethereal Sight: The ghost can see 60 feet into the Ethereal Plane when it is on the Material Plane, and vice versa.', 'Incorporeal Movement: The ghost can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object.'],
    actions: ['Withering Touch: Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 17 (4d6 + 3) necrotic damage.', 'Possession (Recharge 6): One humanoid that the ghost can see within 5 feet of it must succeed on a DC 13 Charisma saving throw or be possessed by the ghost.']
  }
];

export const MonsterCompendium: React.FC = () => {
  const [monsters] = useState<Monster[]>(sampleMonsters);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [filters, setFilters] = useState({
    cr: 'all',
    type: 'all',
    habitat: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const { playSound } = useAudio();
  
  // List of all possible monster types
  const monsterTypes = ['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 
                       'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'];
  
  // List of all possible habitats (extracted from sample monsters)
  const habitats = Array.from(
    new Set(monsters.flatMap(monster => monster.habitat))
  ).sort();

  // CR ranges for filtering
  const crRanges = [
    { value: 'all', label: 'All CRs' },
    { value: '0-1', label: 'CR 0-1' },
    { value: '2-4', label: 'CR 2-4' },
    { value: '5-10', label: 'CR 5-10' },
    { value: '11-16', label: 'CR 11-16' },
    { value: '17+', label: 'CR 17+' }
  ];
  
  const handleMonsterClick = (monster: Monster) => {
    setSelectedMonster(monster);
    playSound('click');
  };
  
  const clearSelectedMonster = () => {
    setSelectedMonster(null);
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
  
  // Calculate ability modifier
  const getAbilityModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };
  
  // Convert CR to string representation
  const formatCR = (cr: number): string => {
    return cr < 1 ? `${cr}` : `${cr}`;
  };
  
  // Check if monster CR is within a specific range
  const isInCRRange = (cr: number, rangeStr: string): boolean => {
    if (rangeStr === 'all') return true;
    
    if (rangeStr === '0-1') return cr >= 0 && cr <= 1;
    if (rangeStr === '2-4') return cr >= 2 && cr <= 4;
    if (rangeStr === '5-10') return cr >= 5 && cr <= 10;
    if (rangeStr === '11-16') return cr >= 11 && cr <= 16;
    if (rangeStr === '17+') return cr >= 17;
    
    return false;
  };
  
  // Filter monsters based on search term and filters
  const filteredMonsters = monsters.filter(monster => {
    const matchesSearch = monster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         monster.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCR = filters.cr === 'all' || isInCRRange(monster.cr, filters.cr);
    const matchesType = filters.type === 'all' || monster.type === filters.type;
    const matchesHabitat = filters.habitat === 'all' || monster.habitat.includes(filters.habitat);
    
    return matchesSearch && matchesCR && matchesType && matchesHabitat;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="magical-card p-6"
      >
        <h1 className="text-3xl font-bold text-center mb-6 glow-text">Monster Compendium</h1>
        
        {/* Search and Filter Controls */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search monsters by name or description..."
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
                  <label className="block mb-2 font-bold">Challenge Rating</label>
                  <select
                    name="cr"
                    value={filters.cr}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-background/70 rounded-md"
                  >
                    {crRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 font-bold">Type</label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-background/70 rounded-md"
                  >
                    <option value="all">All Types</option>
                    {monsterTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 font-bold">Habitat</label>
                  <select
                    name="habitat"
                    value={filters.habitat}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-background/70 rounded-md"
                  >
                    <option value="all">All Habitats</option>
                    {habitats.map(habitat => (
                      <option key={habitat} value={habitat}>{habitat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row md:space-x-6">
          {/* Monster List */}
          <div className={`w-full ${selectedMonster ? 'md:w-1/2' : ''} mb-6 md:mb-0`}>
            <h2 className="text-xl font-bold mb-3 flex items-center">
              <Skull size={20} className="mr-2 text-error" />
              <span>Monsters ({filteredMonsters.length})</span>
            </h2>
            
            {filteredMonsters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMonsters.map(monster => (
                  <motion.div
                    key={monster.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`magical-card p-4 cursor-pointer hover:ring-1 hover:ring-primary transition-all ${
                      selectedMonster?.id === monster.id ? 'ring-2 ring-error' : ''
                    }`}
                    onClick={() => handleMonsterClick(monster)}
                  >
                    <h3 className="font-bold text-lg">{monster.name}</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-foreground/70">{monster.size} {monster.type}</span>
                      <span className="text-xs px-2 py-0.5 bg-error/20 rounded-full">CR {formatCR(monster.cr)}</span>
                    </div>
                    <div className="flex gap-3 mb-2 text-sm">
                      <div className="flex items-center gap-1">
                        <ShieldAlert size={14} className="text-secondary" />
                        <span>{monster.ac}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={14} className="text-error" />
                        <span>{monster.hp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Footprints size={14} className="text-accent" />
                        <span>{monster.speed.split(',')[0]}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/70 line-clamp-2">{monster.description.substring(0, 80)}...</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-muted/20 rounded-lg">
                <Skull size={40} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-foreground/70">No monsters found matching your search criteria.</p>
              </div>
            )}
          </div>
          
          {/* Monster Details */}
          {selectedMonster && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-1/2"
            >
              <div className="magical-card p-6 relative">
                <button
                  className="absolute top-3 right-3 p-1 rounded-full bg-muted hover:bg-muted/70 transition-colors md:hidden"
                  onClick={clearSelectedMonster}
                >
                  <X size={18} />
                </button>
                
                <div className="mb-4 flex items-center">
                  <Skull size={24} className="text-error mr-3" />
                  <h2 className="text-2xl font-bold">{selectedMonster.name}</h2>
                </div>
                
                <div className="mb-4 pb-4 border-b border-primary/20">
                  <p className="text-foreground/70">{selectedMonster.size} {selectedMonster.type}, {selectedMonster.alignment}</p>
                </div>
                
                {/* Basic Stats */}
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <span className="text-xs text-foreground/70 block mb-1">Armor Class</span>
                    <div className="flex items-center justify-center gap-1">
                      <ShieldAlert size={16} className="text-secondary" />
                      <span className="font-bold">{selectedMonster.ac}</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <span className="text-xs text-foreground/70 block mb-1">Hit Points</span>
                    <div className="flex items-center justify-center gap-1">
                      <Heart size={16} className="text-error" />
                      <span className="font-bold">{selectedMonster.hp}</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <span className="text-xs text-foreground/70 block mb-1">Challenge</span>
                    <div className="flex items-center justify-center gap-1">
                      <Swords size={16} className="text-accent" />
                      <span className="font-bold">CR {formatCR(selectedMonster.cr)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Speed */}
                <div className="mb-4">
                  <p className="text-sm text-foreground/70 mb-1">Speed</p>
                  <div className="flex items-center gap-1">
                    <Footprints size={16} className="text-accent" />
                    <span>{selectedMonster.speed}</span>
                  </div>
                </div>
                
                {/* Ability Scores */}
                <div className="mb-4">
                  <p className="text-sm text-foreground/70 mb-1">Abilities</p>
                  <div className="grid grid-cols-6 gap-2 text-center">
                    {Object.entries(selectedMonster.abilities).map(([ability, score]) => (
                      <div key={ability} className="bg-primary/10 rounded-md p-2">
                        <span className="uppercase text-xs font-bold">{ability}</span>
                        <p className="font-bold">{score}</p>
                        <p className="text-xs">{getAbilityModifier(score)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Habitat */}
                <div className="mb-4">
                  <p className="text-sm text-foreground/70 mb-1">Habitat</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMonster.habitat.map(habitat => (
                      <span key={habitat} className="px-2 py-1 bg-secondary/20 rounded-full text-sm">
                        {habitat}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm text-foreground/70 mb-1">Description</p>
                  <p className="text-sm">{selectedMonster.description}</p>
                </div>
                
                {/* Traits */}
                {selectedMonster.traits && selectedMonster.traits.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-bold mb-1">Traits</p>
                    <ul className="space-y-2">
                      {selectedMonster.traits.map((trait, index) => (
                        <li key={index} className="text-sm">{trait}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Actions */}
                {selectedMonster.actions && selectedMonster.actions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <p className="text-sm font-bold mb-1">Actions</p>
                    <ul className="space-y-2">
                      {selectedMonster.actions.map((action, index) => (
                        <li key={index} className="text-sm">{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};