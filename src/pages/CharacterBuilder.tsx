import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { GripHorizontal, ArrowLeft, ArrowRight, Save, Dice1 as Dice, User, BookOpen } from 'lucide-react';

export const CharacterBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [characterData, setCharacterData] = useState({
    name: '',
    race: '',
    class: '',
    background: '',
    alignment: '',
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }
  });
  
  const { playSound } = useAudio();
  
  const totalSteps = 4;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCharacterData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAbilityChange = (ability: string, value: number) => {
    setCharacterData(prev => ({
      ...prev,
      abilities: {
        ...prev.abilities,
        [ability]: value
      }
    }));
  };
  
  const randomizeAbilities = () => {
    playSound('diceRoll');
    
    // Simulate rolling 4d6 and taking the top 3 dice for each ability
    const rollAbility = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      const sorted = rolls.sort((a, b) => b - a);
      return sorted.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };
    
    setCharacterData(prev => ({
      ...prev,
      abilities: {
        strength: rollAbility(),
        dexterity: rollAbility(),
        constitution: rollAbility(),
        intelligence: rollAbility(),
        wisdom: rollAbility(),
        charisma: rollAbility()
      }
    }));
    
    setTimeout(() => {
      playSound('success');
    }, 800);
  };
  
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      playSound('pageChange');
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      playSound('pageChange');
    }
  };
  
  const getModifier = (score: number) => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : modifier.toString();
  };
  
  const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling'];
  const classes = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];
  const backgrounds = ['Acolyte', 'Charlatan', 'Criminal', 'Entertainer', 'Folk Hero', 'Guild Artisan', 'Hermit', 'Noble', 'Outlander', 'Sage', 'Sailor', 'Soldier', 'Urchin'];
  const alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
  
  const renderAbilityScores = () => {
    const abilities = [
      { key: 'strength', name: 'Strength', abbr: 'STR' },
      { key: 'dexterity', name: 'Dexterity', abbr: 'DEX' },
      { key: 'constitution', name: 'Constitution', abbr: 'CON' },
      { key: 'intelligence', name: 'Intelligence', abbr: 'INT' },
      { key: 'wisdom', name: 'Wisdom', abbr: 'WIS' },
      { key: 'charisma', name: 'Charisma', abbr: 'CHA' }
    ];
    
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Ability Scores</h3>
          <button
            className="flex items-center gap-1 bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-md transition-all duration-300"
            onClick={randomizeAbilities}
          >
            <Dice size={18} />
            <span>Roll Abilities</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {abilities.map(ability => (
            <div key={ability.key} className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold">{ability.name}</label>
                <span className="text-lg font-mono bg-primary/20 px-2 py-1 rounded">
                  {getModifier(characterData.abilities[ability.key as keyof typeof characterData.abilities])}
                </span>
              </div>
              <div className="flex items-center">
                <button
                  className="bg-muted px-2 rounded-l-md"
                  onClick={() => handleAbilityChange(
                    ability.key, 
                    Math.max(3, characterData.abilities[ability.key as keyof typeof characterData.abilities] - 1)
                  )}
                >
                  -
                </button>
                <input
                  type="number"
                  min="3"
                  max="18"
                  value={characterData.abilities[ability.key as keyof typeof characterData.abilities]}
                  onChange={(e) => handleAbilityChange(ability.key, parseInt(e.target.value) || 0)}
                  className="w-full text-center bg-muted/50 py-1 border-x-0"
                />
                <button
                  className="bg-muted px-2 rounded-r-md"
                  onClick={() => handleAbilityChange(
                    ability.key, 
                    Math.min(18, characterData.abilities[ability.key as keyof typeof characterData.abilities] + 1)
                  )}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-sm text-foreground/70 bg-muted/20 p-3 rounded-lg">
          <p>Standard ability score generation:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Roll 4d6 and drop the lowest die for each ability</li>
            <li>Or use the standard array: 15, 14, 13, 12, 10, 8</li>
            <li>Or use point buy: 27 points to distribute</li>
          </ul>
        </div>
      </div>
    );
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="step1"
          >
            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
            
            <div className="mb-4">
              <label className="block mb-2 font-bold">Character Name</label>
              <input
                type="text"
                name="name"
                value={characterData.name}
                onChange={handleInputChange}
                placeholder="Enter character name"
                className="w-full p-2 bg-muted/50 rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-bold">Race</label>
                <select
                  name="race"
                  value={characterData.race}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-muted/50 rounded-md"
                >
                  <option value="">Select Race</option>
                  {races.map(race => (
                    <option key={race} value={race}>{race}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-2 font-bold">Class</label>
                <select
                  name="class"
                  value={characterData.class}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-muted/50 rounded-md"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-bold">Background</label>
                <select
                  name="background"
                  value={characterData.background}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-muted/50 rounded-md"
                >
                  <option value="">Select Background</option>
                  {backgrounds.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-2 font-bold">Alignment</label>
                <select
                  name="alignment"
                  value={characterData.alignment}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-muted/50 rounded-md"
                >
                  <option value="">Select Alignment</option>
                  {alignments.map(align => (
                    <option key={align} value={align}>{align}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="step2"
          >
            <h2 className="text-2xl font-bold mb-6">Ability Scores</h2>
            {renderAbilityScores()}
          </motion.div>
        );
      
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="step3"
          >
            <h2 className="text-2xl font-bold mb-6">Skills & Proficiencies</h2>
            
            <p className="text-foreground/70 mb-6">
              Based on your class, background, and ability scores, you'll gain proficiency in various skills.
              Proficient skills get a bonus equal to your proficiency bonus.
            </p>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4">Skill Proficiencies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* This would normally render the actual skill list based on character choices */}
                <div className="flex items-center p-2 bg-muted/30 rounded-md">
                  <input type="checkbox" className="mr-3" />
                  <span>Acrobatics (DEX)</span>
                </div>
                <div className="flex items-center p-2 bg-muted/30 rounded-md">
                  <input type="checkbox" className="mr-3" />
                  <span>Animal Handling (WIS)</span>
                </div>
                <div className="flex items-center p-2 bg-muted/30 rounded-md">
                  <input type="checkbox" className="mr-3" />
                  <span>Arcana (INT)</span>
                </div>
                <div className="flex items-center p-2 bg-muted/30 rounded-md">
                  <input type="checkbox" className="mr-3" />
                  <span>Athletics (STR)</span>
                </div>
                <div className="flex items-center p-2 bg-muted/30 rounded-md">
                  <input type="checkbox" className="mr-3" />
                  <span>Deception (CHA)</span>
                </div>
                <div className="flex items-center p-2 bg-muted/30 rounded-md">
                  <input type="checkbox" className="mr-3" />
                  <span>History (INT)</span>
                </div>
                <div className="flex items-center p-2 bg-muted/30 rounded-md">
                  <input type="checkbox" className="mr-3" />
                  <span>Insight (WIS)</span>
                </div>
                <div className="flex items-center p-2 bg-muted/30 rounded-md">
                  <input type="checkbox" className="mr-3" />
                  <span>Intimidation (CHA)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Other Proficiencies</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-bold mb-2">Armor</h4>
                  <div className="bg-muted/30 p-3 rounded-md h-24">
                    {/* Would be populated based on class */}
                    <p className="text-foreground/70">
                      {characterData.class === 'Fighter' ? 'All armor, shields' : 
                       characterData.class === 'Barbarian' ? 'Light armor, medium armor, shields' : 
                       'None'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Weapons</h4>
                  <div className="bg-muted/30 p-3 rounded-md h-24">
                    {/* Would be populated based on class */}
                    <p className="text-foreground/70">
                      {characterData.class === 'Fighter' ? 'Simple weapons, martial weapons' : 
                       characterData.class === 'Wizard' ? 'Daggers, darts, slings, quarterstaffs, light crossbows' : 
                       'Simple weapons'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Tools</h4>
                  <div className="bg-muted/30 p-3 rounded-md h-24">
                    {/* Would be populated based on class and background */}
                    <p className="text-foreground/70">
                      {characterData.background === 'Entertainer' ? 'Disguise kit, one musical instrument' : 
                       characterData.background === 'Criminal' ? 'One gaming set, thieves\' tools' : 
                       'None'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="step4"
          >
            <h2 className="text-2xl font-bold mb-6">Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="magical-card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <User size={40} className="text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">{characterData.name || 'Unnamed Character'}</h3>
                    <p className="text-foreground/70">
                      {characterData.race || 'Unknown Race'} {characterData.class || 'Unknown Class'}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-foreground/70">Background:</span>
                      <p>{characterData.background || 'Not selected'}</p>
                    </div>
                    <div>
                      <span className="text-foreground/70">Alignment:</span>
                      <p>{characterData.alignment || 'Not selected'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold mb-2">Ability Scores</h4>
                  <div className="grid grid-cols-6 gap-2 text-center">
                    {Object.entries(characterData.abilities).map(([ability, score]) => (
                      <div key={ability} className="bg-primary/10 rounded-md p-2">
                        <span className="uppercase text-xs font-bold">{ability.substring(0, 3)}</span>
                        <p className="font-bold">{score}</p>
                        <p className="text-xs">{getModifier(score)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">Character Sheet Options</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button className="bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2">
                      <Save size={18} />
                      <span>Save Character</span>
                    </button>
                    <button className="bg-secondary hover:bg-secondary/80 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2">
                      <BookOpen size={18} />
                      <span>View Character Sheet</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Next Steps</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Add equipment and inventory items</li>
                    <li>Choose spells if your class can cast them</li>
                    <li>Customize your character's appearance and backstory</li>
                    <li>Join a campaign and start your adventure!</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="magical-card mb-8 p-6 md:p-8"
      >
        <h1 className="text-3xl font-bold text-center mb-8 glow-text">Character Builder</h1>
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="bg-muted/30 h-2 rounded-full">
            <div 
              className="bg-accent h-full rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-foreground/60">
            <span>Basic Info</span>
            <span>Abilities</span>
            <span>Skills</span>
            <span>Summary</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="mb-8">
          {renderStep()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            className="bg-muted hover:bg-muted/70 text-foreground py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft size={18} />
            <span>Previous</span>
          </button>
          
          <button
            className="bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300"
            onClick={nextStep}
            disabled={currentStep === totalSteps}
          >
            <span>{currentStep === totalSteps ? 'Finish' : 'Next'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
      
      {/* Additional Resources */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="magical-card p-6"
      >
        <h2 className="text-xl font-bold mb-4">Character Building Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-bold text-accent mb-2">Race Features</h3>
            <p className="text-sm text-foreground/70 mb-3">
              Each race provides unique abilities, traits, and sometimes ability score increases.
            </p>
            <a href="#" className="text-secondary hover:underline text-sm">View Race Guide</a>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-bold text-accent mb-2">Class Abilities</h3>
            <p className="text-sm text-foreground/70 mb-3">
              Your class determines your hit points, proficiencies, and special abilities.
            </p>
            <a href="#" className="text-secondary hover:underline text-sm">View Class Guide</a>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-bold text-accent mb-2">Background Information</h3>
            <p className="text-sm text-foreground/70 mb-3">
              Backgrounds provide additional proficiencies and roleplaying hooks.
            </p>
            <a href="#" className="text-secondary hover:underline text-sm">View Background Guide</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};