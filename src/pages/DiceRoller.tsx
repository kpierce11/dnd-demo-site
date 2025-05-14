import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { Dice1 as DiceD20Icon, Info, Plus, X } from 'lucide-react';
import DiceBox from '@3d-dice/dice-box';

interface CustomDiceResult {
  type: number;
  value: number;
  id: string;
}

interface SavedRoll {
  name: string;
  dice: number;
  diceType: number;
  modifier: number;
}

export const DiceRoller: React.FC = () => {
  const [diceResults, setDiceResults] = useState<CustomDiceResult[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [diceType, setDiceType] = useState<number>(20);
  const [numberOfDice, setNumberOfDice] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [isRolling, setIsRolling] = useState(false);
  const [savedRolls, setSavedRolls] = useState<SavedRoll[]>([]);
  const [newRollName, setNewRollName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [advantage, setAdvantage] = useState<string>('normal');
  const [isDiceBoxReady, setIsDiceBoxReady] = useState(false);

  const { playSound } = useAudio();
  const diceContainerRef = useRef<HTMLDivElement>(null);
  const diceBoxRef = useRef<DiceBox | null>(null);

  // Initialize DiceBox once on component mount
  useEffect(() => {
    if (!diceContainerRef.current) return;
    
    // Clean up any existing instance first
    if (diceBoxRef.current) {
      try {
        diceBoxRef.current.clear();
      } catch (e) {
        console.warn("Error clearing previous DiceBox instance:", e);
      }
      diceBoxRef.current = null;
    }

    // Configure DiceBox
    const config = {
      container: '#dice-box-container', 
      assetPath: '/assets/dice-box/', // Path to 3D assets
      theme: 'default',
      offscreen: false,           // Make sure this is false to see the dice
      scale: 30,                  // Adjust scale as needed
      gravity: 1,
      throwForce: 10,
      spinForce: 5,
      lightIntensity: 0.9,        // Brighten the scene
      shadowTransparency: 0.8,
    };

    // Create and initialize new DiceBox instance
    const newDiceBox = new DiceBox(config);
    diceBoxRef.current = newDiceBox;
    
    // Initialize DiceBox
    newDiceBox.init()
      .then(() => {
        console.log("DiceBox initialized successfully!");
        setIsDiceBoxReady(true);
      })
      .catch((error) => {
        console.error("Failed to initialize DiceBox:", error);
        setIsDiceBoxReady(false);
      });

    // Clean up on component unmount
    return () => {
      if (diceBoxRef.current) {
        try {
         if (typeof diceBoxRef.current.clear === 'function') {
           diceBoxRef.current.clear();
         } else if (typeof diceBoxRef.current.dispose === 'function') {
           diceBoxRef.current.dispose();
         }
        } catch (e) {
          console.warn("Error during cleanup:", e);
        }
        diceBoxRef.current = null;
      }
    };
  }, []);

  // Load saved rolls from localStorage
  useEffect(() => {
    const savedRollsData = localStorage.getItem('savedRolls');
    if (savedRollsData) {
      try {
        setSavedRolls(JSON.parse(savedRollsData));
      } catch (e) { 
        setSavedRolls([]);
      }
    } else {
      const defaultRolls = [
        { name: 'Attack Roll', dice: 1, diceType: 20, modifier: 5 },
        { name: 'Damage (1d8+3)', dice: 1, diceType: 8, modifier: 3 },
        { name: 'Fireball (8d6)', dice: 8, diceType: 6, modifier: 0 },
        { name: 'Dagger Attack', dice: 1, diceType: 4, modifier: 3 },
        { name: 'Greatsword (2d6+4)', dice: 2, diceType: 6, modifier: 4 },
      ];
      setSavedRolls(defaultRolls);
      localStorage.setItem('savedRolls', JSON.stringify(defaultRolls));
    }
  }, []);

  // Save rolls to localStorage when they change
  useEffect(() => {
    if (savedRolls.length > 0 || localStorage.getItem('savedRolls') !== null) {
      localStorage.setItem('savedRolls', JSON.stringify(savedRolls));
    }
  }, [savedRolls]);

  const rollDice = async (customRoll?: SavedRoll) => {
    if (!diceBoxRef.current || !isDiceBoxReady) {
      console.warn("DiceBox not ready for roll.");
      return;
    }
    
    setIsRolling(true);
    setTotal(null);
    setDiceResults([]);
    playSound('diceRoll');

    const numDice = customRoll?.dice || numberOfDice;
    const typeOfDice = customRoll?.diceType || diceType;
    const currentModifier = customRoll?.modifier || modifier;
    const currentAdvantage = typeOfDice === 20 ? advantage : 'normal';

    try {
      let notation;
      if (currentAdvantage !== 'normal' && typeOfDice === 20) {
        notation = '2d20';
      } else {
        notation = `${numDice}d${typeOfDice}`;
      }

      // Clear any previous dice
      await diceBoxRef.current.clear();
      
      // Roll the dice and wait for results
      const rollResults = await diceBoxRef.current.roll(notation);
      
      if (currentAdvantage !== 'normal' && typeOfDice === 20) {
        // Sort for advantage/disadvantage
        rollResults.sort((a, b) => 
          currentAdvantage === 'advantage' ? b.value - a.value : a.value - b.value
        );
        const chosenDie = rollResults[0];
        setTotal(chosenDie.value + currentModifier);
      } else {
        // Sum the dice values
        const sumOfDice = rollResults.reduce((sum, die) => sum + die.value, 0);
        setTotal(sumOfDice + currentModifier);
      }
      
      // Convert results to our format
      setDiceResults(rollResults.map((d, index) => ({ 
        type: d.sides, 
        value: d.value, 
        id: `${Date.now()}-${index}` 
      })));
      
      // Finish rolling after a delay
      setTimeout(() => { 
        playSound('success'); 
        setIsRolling(false); 
      }, 1500);
      
    } catch (error) {
      console.error("Error rolling with DiceBox:", error);
      setIsRolling(false);
    }
  };
  
  const getResultsString = () => {
    if (diceResults.length === 0) return total !== null ? "Processing..." : "";
    return diceResults.map(d => d.value.toString()).join(' + ');
  };

  const handleSaveRoll = () => {
    if (newRollName.trim()) {
      const newRoll: SavedRoll = { 
        name: newRollName, 
        dice: numberOfDice, 
        diceType: diceType, 
        modifier: modifier 
      };
      setSavedRolls(prevRolls => [...prevRolls, newRoll]);
      setNewRollName('');
      setShowSaveDialog(false);
      playSound('click');
    }
  };

  const handleDeleteSavedRoll = (index: number) => {
    setSavedRolls(prevRolls => prevRolls.filter((_, i) => i !== index));
    playSound('click');
  };

  const handleUseSavedRoll = (saved: SavedRoll) => {
    setNumberOfDice(saved.dice);
    setDiceType(saved.diceType);
    setModifier(saved.modifier);
    if (saved.diceType !== 20) setAdvantage('normal');
    rollDice(saved);
  };

  // Common roll presets
  const commonRolls = [
    { name: 'Attack Roll', description: 'd20 + ability modifier + proficiency', dice: 1, diceType: 20, modifier: 5 },
    { name: 'Damage Roll', description: 'Weapon damage + ability modifier', dice: 1, diceType: 8, modifier: 3 },
    { name: 'Ability Check', description: 'd20 + ability modifier', dice: 1, diceType: 20, modifier: 2 },
    { name: 'Saving Throw', description: 'd20 + saving throw modifier', dice: 1, diceType: 20, modifier: 1 },
    { name: 'Fireball', description: '8d6 fire damage (Dex save for half)', dice: 8, diceType: 6, modifier: 0 },
    { name: 'Sneak Attack (3rd level)', description: '2d6 extra damage', dice: 2, diceType: 6, modifier: 0 }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="magical-card mb-8 p-6 md:p-8"
      >
        <h1 className="text-3xl font-bold text-center mb-6 glow-text">Dice Roller</h1>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4 flex-wrap">
            <div className="flex items-center">
              <label htmlFor="diceCount" className="mr-2 w-auto md:w-20">Dice:</label>
              <select 
                id="diceCount" 
                className="bg-muted text-foreground p-2 rounded-md w-20" 
                value={numberOfDice} 
                onChange={(e) => setNumberOfDice(parseInt(e.target.value))} 
                disabled={isRolling || !isDiceBoxReady}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <span className="mx-2 text-xl">d</span>
              <select 
                className="bg-muted text-foreground p-2 rounded-md w-20" 
                value={diceType} 
                onChange={(e) => {
                  const newType = parseInt(e.target.value);
                  setDiceType(newType);
                  if (newType !== 20) setAdvantage('normal');
                }} 
                disabled={isRolling || !isDiceBoxReady}
              >
                {[4, 6, 8, 10, 12, 20, 100].map(typeValue => (
                  <option key={typeValue} value={typeValue}>{typeValue}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <span className="mx-2 text-xl">+</span>
              <input 
                type="number" 
                className="bg-muted text-foreground p-2 rounded-md w-20" 
                value={modifier} 
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)} 
                disabled={isRolling || !isDiceBoxReady}
              />
            </div>
            
            {diceType === 20 && (
              <div className="flex items-center ml-0 md:ml-4">
                <select 
                  className="bg-muted text-foreground p-2 rounded-md w-full md:w-40" 
                  value={advantage} 
                  onChange={(e) => setAdvantage(e.target.value)} 
                  disabled={isRolling || !isDiceBoxReady}
                >
                  <option value="normal">Normal Roll</option>
                  <option value="advantage">Advantage</option>
                  <option value="disadvantage">Disadvantage</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-primary hover:bg-primary/80 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50" 
              onClick={() => rollDice()} 
              disabled={isRolling || !isDiceBoxReady}
            >
              <DiceD20Icon size={20} />
              <span>
                Roll {numberOfDice}d{diceType}
                {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
                {diceType === 20 && advantage !== 'normal' ? 
                  ` (${advantage === 'advantage' ? 'Advantage' : 'Disadvantage'})` : ''}
              </span>
            </button>
            
            <button 
              className="bg-secondary hover:bg-secondary/80 text-white py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-300" 
              onClick={() => setShowSaveDialog(true)} 
              disabled={isRolling || !isDiceBoxReady}
            >
              <Plus size={20} className="mr-2" />
              <span>Save Roll</span>
            </button>
          </div>
        </div>

        <div className="relative rounded-lg mb-6 overflow-hidden border border-dashed border-foreground/30 bg-background/40 backdrop-blur-sm"
             style={{ minHeight: '300px', height: '300px', width: '100%' }}>
          {!isDiceBoxReady && (
            <div className="absolute inset-0 flex items-center justify-center text-foreground/50">
              <p>Loading 3D Dice...</p>
            </div>
          )}
          
          {isDiceBoxReady && diceResults.length === 0 && !isRolling && !total && (
            <div className="absolute inset-0 flex items-center justify-center text-foreground/50">
              <p className="flex items-center">
                <Info size={20} className="mr-2" />
                Roll the dice!
              </p>
            </div>
          )}
          
          <div ref={diceContainerRef}
               id="dice-box-container"
               style={{ width: '100%', height: '100%', position: 'relative' }}
          />
        </div>
        
        {total !== null && !isRolling && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center mb-6"
          >
            <p className="text-xl">
              Result: <span className="font-bold text-3xl text-accent glow-text">{total}</span>
            </p>
            <p className="text-foreground/70 text-sm">
              ({getResultsString()})
              {modifier !== 0 ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : ''}
            </p>
          </motion.div>
        )}
        
        <div>
          <h3 className="text-xl font-bold mb-3">Saved Rolls</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {savedRolls.map((saved, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-3 group relative">
                <button 
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-error/20 hover:bg-error rounded-full p-1 z-10" 
                  onClick={() => handleDeleteSavedRoll(index)} 
                  aria-label={`Delete saved roll: ${saved.name}`}
                >
                  <X size={14} />
                </button>
                
                <div onClick={() => handleUseSavedRoll(saved)} className="cursor-pointer">
                  <h4 className="font-bold">{saved.name}</h4>
                  <p className="text-sm text-foreground/70">
                    {saved.dice}d{saved.diceType}
                    {saved.modifier !== 0 ? (saved.modifier > 0 ? `+${saved.modifier}` : saved.modifier) : ''}
                  </p>
                  <button 
                    tabIndex={-1} 
                    className="mt-2 bg-primary/50 hover:bg-primary text-white py-1 px-3 rounded-md text-sm w-full"
                  >
                    Roll
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" 
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }} 
              className="magical-card p-6 max-w-md w-full" 
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Save Roll Configuration</h3>
              <p className="mb-4 text-foreground/70">
                Current: {numberOfDice}d{diceType}
                {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
              </p>
              
              <div className="mb-4">
                <label htmlFor="rollName" className="block mb-2">Roll Name:</label>
                <input 
                  id="rollName" 
                  type="text" 
                  className="w-full p-2 bg-muted text-foreground rounded-md" 
                  value={newRollName} 
                  onChange={(e) => setNewRollName(e.target.value)} 
                  placeholder="e.g., Greatsword Attack"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  className="bg-muted hover:bg-muted/70 text-foreground py-2 px-4 rounded-md" 
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </button>
                <button 
                  className="bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-md" 
                  onClick={handleSaveRoll} 
                  disabled={!newRollName.trim()}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }} 
        className="magical-card p-6"
      >
        <h2 className="text-xl font-bold mb-4">Common Dice Rolls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {commonRolls.map((roll, index) => (
            <div 
              key={index} 
              className="bg-muted/30 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleUseSavedRoll(roll)}
            >
              <h3 className="font-bold text-accent mb-1">{roll.name}</h3>
              <p className="text-sm text-foreground/70 mb-2">{roll.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono bg-primary/20 px-2 py-1 rounded">
                  {roll.dice}d{roll.diceType}
                  {roll.modifier !== 0 ? (roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier) : ''}
                </span>
                <button className="text-xs bg-accent/20 hover:bg-accent/40 px-2 py-1 rounded-md">
                  Roll
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold text-accent">Ability Checks & Saving Throws</h3>
            <p className="text-foreground/70 mb-2">d20 + ability modifier (+ proficiency bonus if proficient)</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Natural 20: Critical Success</li>
              <li>Natural 1: Critical Failure</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-accent">Attack Rolls</h3>
            <p className="text-foreground/70 mb-2">d20 + ability modifier + proficiency bonus</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Natural 20: Critical Hit (double damage dice)</li>
              <li>Natural 1: Critical Miss</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DiceRoller;