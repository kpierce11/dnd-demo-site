import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { Dice1 as DiceD20Icon, Info, Plus, X } from 'lucide-react';
import DiceBox, { DiceRoll } from '@3d-dice/dice-box';

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

  const { playSound } = useAudio();
  const diceContainerDivRef = useRef<HTMLDivElement>(null);
  const diceBoxInstanceRef = useRef<DiceBox | null>(null);
  const [isDiceBoxReady, setIsDiceBoxReady] = useState(false);

useEffect(() => {
  console.log("DiceRoller: useEffect triggered.");
  let isEffectActive = true; // To prevent updates if this effect instance is cleaned up
  let createdBoxInThisRun: DiceBox | null = null;

  // Only proceed if the container div is available
  if (!diceContainerDivRef.current) {
    console.warn("DiceRoller: diceContainerDivRef.current is null. Skipping DiceBox init.");
    return;
  }

  console.log("DiceRoller: Attempting DiceBox Init. diceBoxInstanceRef.current:", diceBoxInstanceRef.current);

  const diceBoxConfig = {
    id: 'dice-box-container',
    assetPath: '/assets/dice-box/',
    theme: 'default',
    offscreen: true,
    scale: 30,
    gravity: 1,
    throwForce: 5,
  };
  console.log("DiceRoller: DiceBox Config being used:", diceBoxConfig);

  const newDiceBox = new DiceBox(diceBoxConfig);
  createdBoxInThisRun = newDiceBox;
  // Update the ref immediately. If another effect run cleans up,
  // it will null out the ref. This specific instance's init promise
  // will then see that diceBoxInstanceRef.current !== newDiceBox.
  diceBoxInstanceRef.current = newDiceBox;
  setIsDiceBoxReady(false); // Assume not ready until init completes

  newDiceBox.init()
    .then(() => {
      if (isEffectActive) { // Check if this specific effect instance is still the "active" one
        // If the main ref still points to the box created in THIS run, it means
        // this is likely the "final" setup in StrictMode, or the only setup in prod.
        if (diceBoxInstanceRef.current === newDiceBox) {
          console.log("DiceRoller: DiceBox Initialized! SUCCESS!");
          setIsDiceBoxReady(true);
        } else {
          // The main ref was changed by a subsequent effect run/cleanup.
          // This instance (newDiceBox) is now orphaned, so clean it up.
          console.warn("DiceRoller: DiceBox init completed for an instance that is no longer the primary. Cleaning it up.");
          newDiceBox.clear?.();
        }
      } else {
        // This effect instance was cleaned up before its init completed. Clean up the box it created.
        console.warn("DiceRoller: DiceBox init completed for a cleaned-up effect. Cleaning up this box.");
        newDiceBox.clear?.();
      }
    })
    .catch(err => {
      if (isEffectActive) {
        console.error("DiceRoller: DiceBox init FAILED:", err);
        // If this failed instance is still the one in the ref, nullify it.
        if (diceBoxInstanceRef.current === newDiceBox) {
          diceBoxInstanceRef.current = null;
        }
        setIsDiceBoxReady(false);
      }
    });

  return () => {
    console.log("DiceRoller: EFFECT CLEANUP for a DiceBox instance.");
    isEffectActive = false;

    // If the instance being cleaned up is the one this effect created,
    // and it's also the one currently in the main ref, then it's the "active" one being cleaned up.
    if (createdBoxInThisRun && diceBoxInstanceRef.current === createdBoxInThisRun) {
      console.log("DiceRoller: Cleanup - Clearing the primary DiceBox instance.");
      try {
        // It's possible init never finished, so `clear` might not be available.
        // Check if it was set to ready, or more safely, just try to call clear.
        createdBoxInThisRun.clear?.();
      } catch (e: any) {
        console.warn("DiceRoller: Cleanup - Error during primary .clear():", e.message);
      }
      diceBoxInstanceRef.current = null; // Null out the main ref
      setIsDiceBoxReady(false);
    } else if (createdBoxInThisRun) {
      // This effect's instance was superseded or never became the primary.
      // It should have been cleaned up by its own init promise's else/catch,
      // but as a fallback, try to clean it here too.
      console.log("DiceRoller: Cleanup - Clearing a superseded/orphaned DiceBox instance.");
      createdBoxInThisRun.clear?.();
    }
  };
}, []); // Empty dependency array

  useEffect(() => {
    const savedRollsData = localStorage.getItem('savedRolls');
    if (savedRollsData) {
      try {
        setSavedRolls(JSON.parse(savedRollsData));
      } catch (e) { setSavedRolls([]); }
    } else {
      const defaultRolls = [
        { name: 'Attack Roll', dice: 1, diceType: 20, modifier: 5 },
        { name: 'Damage (1d8+3)', dice: 1, diceType: 8, modifier: 3 },
      ];
      setSavedRolls(defaultRolls);
      localStorage.setItem('savedRolls', JSON.stringify(defaultRolls));
    }
  }, []);

  useEffect(() => {
    if (savedRolls.length > 0 || localStorage.getItem('savedRolls') !== null) {
      localStorage.setItem('savedRolls', JSON.stringify(savedRolls));
    }
  }, [savedRolls]);

  const rollDice = async (customRoll?: SavedRoll) => {
    if (!diceBoxInstanceRef.current || !isDiceBoxReady) {
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

    let diceBoxRolledResults: DiceRoll[];

    try {
      if (currentAdvantage !== 'normal' && typeOfDice === 20) {
        const rollResults = await diceBoxInstanceRef.current.roll('2d20');
        diceBoxRolledResults = rollResults as DiceRoll[];
        if (!diceBoxRolledResults || diceBoxRolledResults.length !== 2) throw new Error("Adv/Dis roll != 2 dice.");
        diceBoxRolledResults.sort((a, b) => currentAdvantage === 'advantage' ? b.value - a.value : a.value - b.value);
        const chosenDie = diceBoxRolledResults[0];
        setTotal(chosenDie.value + currentModifier);
        setDiceResults(diceBoxRolledResults.map((d, index) => ({ type: typeOfDice, value: d.value, id: `${Date.now()}-adv-${index}` })));
      } else {
        const notation = `${numDice}d${typeOfDice}`;
        const rollResults = await diceBoxInstanceRef.current.roll(notation);
        diceBoxRolledResults = rollResults as DiceRoll[];
        const sumOfDice = diceBoxRolledResults.reduce((sum, die) => sum + die.value, 0);
        setTotal(sumOfDice + currentModifier);
        setDiceResults(diceBoxRolledResults.map((d, index) => ({ type: d.sides, value: d.value, id: `${Date.now()}-${index}` })));
      }
      setTimeout(() => { playSound('success'); setIsRolling(false); }, 500); 
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
      const newRoll: SavedRoll = { name: newRollName, dice: numberOfDice, diceType: diceType, modifier: modifier };
      setSavedRolls(prevRolls => [...prevRolls, newRoll]);
      setNewRollName(''); setShowSaveDialog(false); playSound('click');
    }
  };

  const handleDeleteSavedRoll = (index: number) => {
    setSavedRolls(prevRolls => prevRolls.filter((_, i) => i !== index));
    playSound('click');
  };

  const handleUseSavedRoll = (saved: SavedRoll) => {
    setNumberOfDice(saved.dice); setDiceType(saved.diceType); setModifier(saved.modifier);
    if (saved.diceType !== 20) setAdvantage('normal');
    rollDice(saved);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="magical-card mb-8 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-6 glow-text">Dice Roller</h1>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4 flex-wrap">
            <div className="flex items-center">
              <label htmlFor="diceCount" className="mr-2 w-auto md:w-20">Dice:</label>
              <select id="diceCount" className="bg-muted text-foreground p-2 rounded-md w-20" value={numberOfDice} onChange={(e) => setNumberOfDice(parseInt(e.target.value))} disabled={isRolling || !isDiceBoxReady}>
                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (<option key={num} value={num}>{num}</option>))}
              </select>
            </div>
            <div className="flex items-center">
              <span className="mx-2 text-xl">d</span>
              <select className="bg-muted text-foreground p-2 rounded-md w-20" value={diceType} onChange={(e) => { const newType = parseInt(e.target.value); setDiceType(newType); if (newType !== 20) setAdvantage('normal'); }} disabled={isRolling || !isDiceBoxReady}>
                {[4, 6, 8, 10, 12, 20, 100].map(typeValue => (<option key={typeValue} value={typeValue}>{typeValue}</option>))}
              </select>
            </div>
            <div className="flex items-center">
              <span className="mx-2 text-xl">+</span>
              <input type="number" className="bg-muted text-foreground p-2 rounded-md w-20" value={modifier} onChange={(e) => setModifier(parseInt(e.target.value) || 0)} disabled={isRolling || !isDiceBoxReady} />
            </div>
            {diceType === 20 && (
              <div className="flex items-center ml-0 md:ml-4">
                <select className="bg-muted text-foreground p-2 rounded-md w-full md:w-40" value={advantage} onChange={(e) => setAdvantage(e.target.value)} disabled={isRolling || !isDiceBoxReady}>
                  <option value="normal">Normal Roll</option>
                  <option value="advantage">Advantage</option>
                  <option value="disadvantage">Disadvantage</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary hover:bg-primary/80 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50" onClick={() => rollDice()} disabled={isRolling || !isDiceBoxReady}>
              <DiceD20Icon size={20} />
              <span>Roll {numberOfDice}d{diceType}{modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}</span>
            </button>
            <button className="bg-secondary hover:bg-secondary/80 text-white py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-300" onClick={() => setShowSaveDialog(true)} disabled={isRolling || !isDiceBoxReady}>
              <Plus size={20} className="mr-2" />
              <span>Save Roll</span>
            </button>
          </div>
        </div>

        <div 
            className="relative rounded-lg mb-6 overflow-hidden border border-dashed border-foreground/30"
            style={{ 
                minHeight: '400px', 
                height: '400px',    
                width: '100%'       
            }}
        >
          {!isDiceBoxReady && !diceBoxInstanceRef.current && (
            <div className="absolute inset-0 flex items-center justify-center text-foreground/50"><p>Loading 3D Dice...</p></div>
          )}
          {isDiceBoxReady && diceResults.length === 0 && !isRolling && !total && (
             <div className="absolute inset-0 flex items-center justify-center text-foreground/50">
                <p className="flex items-center"><Info size={20} className="mr-2" />Roll the dice!</p>
             </div>
           )}
          <div 
            ref={diceContainerDivRef} 
            id="dice-box-container" 
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'absolute', 
              top: 0, 
              left: 0 
            }}
          >
            {/* This div is for DiceBox */}
          </div>
        </div>
        
        {total !== null && !isRolling && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6">
            <p className="text-xl">Result: <span className="font-bold text-3xl text-accent glow-text">{total}</span></p>
            <p className="text-foreground/70 text-sm">({getResultsString()}){modifier !== 0 ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : ''}</p>
          </motion.div>
        )}
        
        <div>
          <h3 className="text-xl font-bold mb-3">Saved Rolls</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {savedRolls.map((saved, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-3 group relative">
                <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-error/20 hover:bg-error rounded-full p-1 z-10" onClick={() => handleDeleteSavedRoll(index)} aria-label={`Delete saved roll: ${saved.name}`}><X size={14} /></button>
                <div onClick={() => handleUseSavedRoll(saved)} className="cursor-pointer">
                  <h4 className="font-bold">{saved.name}</h4>
                  <p className="text-sm text-foreground/70">{saved.dice}d{saved.diceType}{saved.modifier !== 0 ? (saved.modifier > 0 ? `+${saved.modifier}` : saved.modifier) : ''}</p>
                  <button tabIndex={-1} className="mt-2 bg-primary/50 hover:bg-primary text-white py-1 px-3 rounded-md text-sm w-full">Roll</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowSaveDialog(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="magical-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Save Roll Configuration</h3>
              <p className="mb-4 text-foreground/70">Current: {numberOfDice}d{diceType}{modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}</p>
              <div className="mb-4">
                <label htmlFor="rollName" className="block mb-2">Roll Name:</label>
                <input id="rollName" type="text" className="w-full p-2 bg-muted text-foreground rounded-md" value={newRollName} onChange={(e) => setNewRollName(e.target.value)} placeholder="e.g., Greatsword Attack"/>
              </div>
              <div className="flex justify-end gap-3">
                <button className="bg-muted hover:bg-muted/70 text-foreground py-2 px-4 rounded-md" onClick={() => setShowSaveDialog(false)}>Cancel</button>
                <button className="bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-md" onClick={handleSaveRoll} disabled={!newRollName.trim()}>Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="magical-card p-6">
        <h2 className="text-xl font-bold mb-4">Common Dice Rolls</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold text-accent">Ability Checks & Saving Throws</h3>
            <p className="text-foreground/70 mb-2">d20 + ability modifier (+ proficiency bonus if proficient)</p>
             <ul className="list-disc pl-5 text-sm"><li>Natural 20: Critical Success</li><li>Natural 1: Critical Failure</li></ul>
          </div>
          <div>
            <h3 className="font-bold text-accent">Attack Rolls</h3>
            <p className="text-foreground/70 mb-2">d20 + ability modifier + proficiency bonus</p>
            <ul className="list-disc pl-5 text-sm"><li>Natural 20: Critical Hit (double damage dice)</li><li>Natural 1: Critical Miss</li></ul>
          </div>
          <div>
            <h3 className="font-bold text-accent">Advantage & Disadvantage</h3>
            <p className="text-foreground/70 mb-2">Roll two d20s instead of one</p>
            <ul className="list-disc pl-5 text-sm"><li>Advantage: Take the higher roll</li><li>Disadvantage: Take the lower roll</li></ul>
          </div>
          <div>
            <h3 className="font-bold text-accent">Common Damage Dice</h3>
            <p className="text-foreground/70">Weapon damage examples:</p>
            <ul className="list-disc pl-5 text-sm"><li>Dagger: 1d4 + modifier</li><li>Longsword: 1d8 + modifier</li><li>Greatsword: 2d6 + modifier</li></ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DiceRoller;