import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { Dice1 as DiceD20Icon, Info, Plus, X } from 'lucide-react';
import DiceBox from '@3d-dice/dice-box';

interface CustomDiceResult {
	type: number;
	value: number;
	id: string;
    selected?: boolean;
}

interface SavedRoll {
	name: string;
	dice: number;
	diceType: number;
	modifier: number;
	advantage?: string;
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
	const [showDice, setShowDice] = useState(false);

	const { playSound } = useAudio();
	const diceBoxRef = useRef<DiceBox | null>(null);
    const diceContainerRef = useRef<HTMLDivElement>(null); // Ref for the new container div
    const animationFrameIdRef = useRef<number>(0);
    const resizeHandlerRef = useRef<(() => void) | null>(null);


	useEffect(() => {
		// Ensure the container div is available
		if (!diceContainerRef.current) return;

		console.log("Starting DiceBox initialization with dedicated container...");

		// Cleanup previous instance if any
		if (diceBoxRef.current) {
			try {
				if (typeof diceBoxRef.current.clear === 'function') diceBoxRef.current.clear();
				if (typeof diceBoxRef.current.dispose === 'function') {
					diceBoxRef.current.dispose();
				} else if (typeof (diceBoxRef.current as any).destroy === 'function') {
					(diceBoxRef.current as any).destroy();
				}
			} catch (e) {
				console.warn("Error cleaning up previous DiceBox instance:", e);
			}
			diceBoxRef.current = null;
		}
        
        let resizeObserver: ResizeObserver | null = null;

		try {
			const config = {
                // Use the ref to the dedicated div as the container
				container: diceContainerRef.current, 
				assetPath: '/assets/dice-box/',
				theme: 'default',
				scale: 7, 
				gravity: 1,
				throwForce: 6,
				spinForce: 3,
				lightIntensity: 0.8,
				shadowTransparency: 0.8,
                // id can be omitted if container is a direct element ref,
                // but DiceBox might still use it or create its own if needed.
                // For now, let's remove it to simplify and let DiceBox manage canvas creation within the container.
				// id: 'dice-box-explicit-canvas', 
                engineOptions: { 
                    antialias: true,
                    adaptToDeviceRatio: true, 
                }
			};

			console.log("Creating new DiceBox with config:", config);
			const newDiceBox = new DiceBox(config);
			diceBoxRef.current = newDiceBox;

			console.log("Initializing DiceBox...");
			newDiceBox.init()
				.then(() => {
					console.log("DiceBox initialized successfully in dedicated container!");
					setIsDiceBoxReady(true);

                    // DiceBox creates its canvas inside diceContainerRef.current
                    // The canvas styling for position/size is now handled by the container div's styles.
                    // We still need to ensure DiceBox's internal engine resizes correctly.
					const internalCanvas = diceContainerRef.current?.querySelector('canvas');

                    const updateDiceBoxEngineSize = () => {
                        if (!diceContainerRef.current || !diceBoxRef.current) return;
                        
                        // The display dimensions are now dictated by the container div
                        const displayWidth = diceContainerRef.current.clientWidth;
                        const displayHeight = diceContainerRef.current.clientHeight;
                        
                        if (typeof diceBoxRef.current.resize === 'function') {
                            console.log(`Calling DiceBox.resize(${displayWidth}, ${displayHeight}) for container.`);
                            // Pass CSS pixel dimensions; adaptToDeviceRatio should handle DPR.
                            diceBoxRef.current.resize(displayWidth, displayHeight);
                        } else {
                            console.warn("DiceBox resize method not found.");
                        }
                    };
                        
                    resizeHandlerRef.current = () => {
                        cancelAnimationFrame(animationFrameIdRef.current);
                        animationFrameIdRef.current = requestAnimationFrame(updateDiceBoxEngineSize);
                    };
                    
                    // Initial sizing
                    requestAnimationFrame(updateDiceBoxEngineSize);

                    // Observe the container div itself for size changes
                    if (typeof ResizeObserver !== 'undefined' && diceContainerRef.current) {
                        resizeObserver = new ResizeObserver(resizeHandlerRef.current);
                        resizeObserver.observe(diceContainerRef.current); 
                    } else {
                         window.addEventListener('resize', resizeHandlerRef.current);
                    }

                    // Ensure dice canvas inside container is not blocking pointer events unnecessarily
                    if (internalCanvas) {
                        internalCanvas.style.pointerEvents = 'none';
                    }

				})
				.catch((error) => {
					console.error("Failed to initialize DiceBox:", error);
					setIsDiceBoxReady(false);
				});
		} catch (error) {
			console.error("Error creating DiceBox:", error);
			setIsDiceBoxReady(false);
		}

		return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            if (resizeObserver) {
                resizeObserver.disconnect();
            } else if (resizeHandlerRef.current) { 
                 window.removeEventListener('resize', resizeHandlerRef.current);
            }
            resizeHandlerRef.current = null;
            
			if (diceBoxRef.current) {
				try {
					if (typeof diceBoxRef.current.clear === 'function') {
						diceBoxRef.current.clear();
					}
					if (typeof diceBoxRef.current.dispose === 'function') {
						diceBoxRef.current.dispose();
					} else if (typeof (diceBoxRef.current as any).destroy === 'function') {
						(diceBoxRef.current as any).destroy();
					}
				} catch (e) {
					console.warn("Error disposing of DiceBox instance:", e);
				}
			}
            // DiceBox should clean up its own canvas when disposed if it created it within our container.
            // If diceContainerRef.current still has child elements, you might want to clear them manually here,
            // but DiceBox dispose should ideally handle it.
            if (diceContainerRef.current) {
                // diceContainerRef.current.innerHTML = ''; // Optional: force clear container
            }
			diceBoxRef.current = null;
		};
	}, []); // Runs once on mount and cleanup on unmount


	useEffect(() => {
		const savedRollsData = localStorage.getItem('savedRolls');
		if (savedRollsData) {
			try {
				setSavedRolls(JSON.parse(savedRollsData));
			} catch (e) {
				setSavedRolls([]);
			}
		} else {
			const defaultRolls: SavedRoll[] = [
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

	useEffect(() => {
		if (savedRolls.length > 0 || localStorage.getItem('savedRolls') !== null) {
			localStorage.setItem('savedRolls', JSON.stringify(savedRolls));
		}
	}, [savedRolls]);

	const handleOverlayClick = () => {
		if (diceBoxRef.current && !isRolling && showDice) {
            console.log("Overlay clicked, attempting to clear dice. isRolling:", isRolling, "showDice:", showDice);
			diceBoxRef.current.clear();
			setDiceResults([]);
			setTotal(null);
			setShowDice(false);

            // The container div handles pointer events for clearing,
            // the internal canvas should not interfere.
		}
	};


	const rollDice = async (customRoll?: SavedRoll) => {
		if (!diceBoxRef.current || !isDiceBoxReady) {
			console.warn("DiceBox not ready for roll. isDiceBoxReady:", isDiceBoxReady, "diceBoxRef.current:", diceBoxRef.current);
			return;
		}

		setIsRolling(true);
		setTotal(null);
		setDiceResults([]);
		setShowDice(true); // This will make the diceContainerRef visible
		playSound('diceRoll');

		const numDice = customRoll?.dice || numberOfDice;
		const typeOfDice = customRoll?.diceType || diceType;
		const currentModifier = customRoll?.modifier || modifier;
		const currentAdvantage = customRoll?.advantage || advantage;

		try {
			let notation;
			if (typeOfDice === 20 && currentAdvantage !== 'normal') {
				notation = '2d20';
			} else {
				notation = `${numDice}d${typeOfDice}`;
			}

			await diceBoxRef.current.clear();
			console.log("Rolling dice with notation:", notation);
			const rollResults = await diceBoxRef.current.roll(notation);
			console.log("Raw roll results from DiceBox:", rollResults);

            let calculatedTotal = 0;
            let processedResults: CustomDiceResult[] = [];

            if (typeOfDice === 20 && (currentAdvantage === 'advantage' || currentAdvantage === 'disadvantage') && rollResults.length >= 2) {
                const sortedResults = [...rollResults].sort((a: any, b: any) => a.value - b.value);
                const selectedDie = currentAdvantage === 'advantage' ? sortedResults[1] : sortedResults[0]; 

                calculatedTotal = selectedDie.value + currentModifier;
                processedResults = rollResults.map((d: any) => ({ 
                    type: d.sides,
                    value: d.value,
                    id: d.id, 
                    selected: d.id === selectedDie.id 
                }));

            } else {
                const sumOfDice = rollResults.reduce((sum: number, die: any) => sum + die.value, 0);
                calculatedTotal = sumOfDice + currentModifier;
                processedResults = rollResults.map((d: any) => ({
                    type: d.sides,
                    value: d.value,
                    id: d.id, 
                    selected: true 
                }));
            }

			setTotal(calculatedTotal);
			setDiceResults(processedResults);

            diceBoxRef.current.onRollComplete = (results: any) => {
                console.log("Roll complete:", results);
                playSound('success');
                setIsRolling(false);
                // The overlay click will handle hiding
            };

		} catch (error) {
			console.error("Error rolling with DiceBox:", error);
			setIsRolling(false);
            setShowDice(false); // Hide on error
        }
	};

	const getResultsString = () => {
        if (diceResults.length === 0) return total !== null ? "Processing..." : "";

        if (diceType === 20 && (advantage === 'advantage' || advantage === 'disadvantage') && diceResults.length >= 2) {
             return diceResults.map(d =>
                 d.selected ? `[${d.value}]` : d.value.toString()
             ).join(' + ');
        }

		return diceResults.map(d => d.value.toString()).join(' + ');
	};

	const handleSaveRoll = () => {
		if (newRollName.trim()) {
			const newRoll: SavedRoll = {
				name: newRollName,
				dice: numberOfDice,
				diceType: diceType,
				modifier: modifier,
				advantage: diceType === 20 ? advantage : undefined,
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
		if (saved.diceType === 20 && saved.advantage !== undefined) {
			setAdvantage(saved.advantage);
		} else {
			setAdvantage('normal');
		}
		rollDice(saved);
	};

	const commonRolls: SavedRoll[] = [
		{ name: 'Attack Roll', description: 'd20 + ability modifier + proficiency', dice: 1, diceType: 20, modifier: 5 },
		{ name: 'Damage (1d8+3)', description: 'Weapon damage + ability modifier', dice: 1, diceType: 8, modifier: 3 },
		{ name: 'Ability Check', description: 'd20 + ability modifier', dice: 1, diceType: 20, modifier: 2 },
		{ name: 'Saving Throw', description: 'd20 + saving throw modifier', dice: 1, diceType: 20, modifier: 1 },
		{ name: 'Fireball (8d6)', dice: 8, diceType: 6, modifier: 0 },
		{ name: 'Sneak Attack (3rd level)', description: '2d6 extra damage', dice: 2, diceType: 6, modifier: 0 }
	];

	const diceTypes = [4, 6, 8, 10, 12, 20, 100];
	const numberOfDiceOptions = Array.from({ length: 20 }, (_, i) => i + 1);
	const modifierOptions = Array.from({ length: 21 }, (_, i) => i - 10);

    useEffect(() => {
        if (diceType === 20 && advantage !== 'normal') {
            setNumberOfDice(1);
        }
    }, [diceType, advantage]);


	return (
        <>
            {/* Fullscreen-like container for the dice simulation */}
            <div
                ref={diceContainerRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: showDice ? 1000 : -1, // Show only when dice are active
                    pointerEvents: showDice && !isRolling ? 'auto' : 'none', // Allow clicks only when dice are shown and not rolling
                    visibility: showDice ? 'visible' : 'hidden',
                }}
                onClick={handleOverlayClick} // Click on container to clear dice
            />

            <div className="max-w-6xl mx-auto relative z-20"> {/* Ensure UI is above the dice container if zIndex were lower */}
                {/* The overlay div previously used is now effectively diceContainerRef itself 
                    when showDice is true and pointerEvents is 'auto'.
                */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="magical-card mb-8 p-6 md:p-8 flex flex-col flex-grow"
                >
                    <h1 className="text-3xl font-bold text-center mb-6 glow-text">Dice Roller</h1>

                    {/* ... rest of your UI code (selectors, buttons, results display) remains the same ... */}
                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div>
                            <label htmlFor="numDice" className="block mb-1 font-bold">Number of Dice</label>
                            <select
                                id="numDice"
                                value={numberOfDice}
                                onChange={(e) => setNumberOfDice(parseInt(e.target.value) || 1)}
                                className="w-full p-2 bg-muted/50 rounded-md"
                                disabled={diceType === 20 && advantage !== 'normal'}
                            >
                                {diceType === 20 && advantage !== 'normal' ? (
                                    <option value={1}>1</option>
                                ) : (
                                    numberOfDiceOptions.map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="diceType" className="block mb-1 font-bold">Type of Dice</label>
                            <select
                                id="diceType"
                                value={diceType}
                                onChange={(e) => {
                                    const newDiceType = parseInt(e.target.value);
                                    setDiceType(newDiceType);
                                    if (newDiceType !== 20) {
                                        setAdvantage('normal');
                                    } else {
                                        if (advantage !== 'normal') {
                                            setNumberOfDice(1);
                                        }
                                    }
                                }}
                                className="w-full p-2 bg-muted/50 rounded-md"
                            >
                                {diceTypes.map(type => (
                                    <option key={type} value={type}>D{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="modifier" className="block mb-1 font-bold">Modifier</label>
                            <select
                                id="modifier"
                                value={modifier}
                                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                                className="w-full p-2 bg-muted/50 rounded-md"
                            >
                                {modifierOptions.map(mod => (
                                    <option key={mod} value={mod}>{mod > 0 ? `+${mod}` : mod}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {diceType === 20 && (
                        <div className="mb-6 text-center">
                            <label className="block mb-2 font-bold">Advantage/Disadvantage</label>
                            <div className="inline-flex rounded-md shadow-sm">
                                <button
                                    className={`py-2 px-4 rounded-l-lg transition-colors ${advantage === 'advantage' ? 'bg-accent text-white' : 'bg-muted/50 hover:bg-muted/70'}`}
                                    onClick={() => setAdvantage('advantage')}
                                >
                                    Advantage
                                </button>
                                <button
                                    className={`py-2 px-4 transition-colors ${advantage === 'normal' ? 'bg-accent text-white' : 'bg-muted/50 hover:bg-muted/70'}`}
                                    onClick={() => setAdvantage('normal')}
                                >
                                    Normal
                                </button>
                                <button
                                    className={`py-2 px-4 rounded-r-lg transition-colors ${advantage === 'disadvantage' ? 'bg-accent text-white' : 'bg-muted/50 hover:bg-muted/70'}`}
                                    onClick={() => setAdvantage('disadvantage')}
                                >
                                    Disadvantage
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
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

                    {total !== null && !isRolling && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center mb-6"
                        >
                            <p className="text-xl">
                                Result: <span className="font-bold text-3xl text-accent glow-text">{total}</span>
                            </p>
                            {diceResults.length > 0 && (
                                <p className="text-foreground/70 text-sm">
                                    {getResultsString()}
                                    {modifier !== 0 ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : ''}
                                </p>
                            )}
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
                                            {saved.diceType === 20 && saved.advantage !== undefined ?
                                                ` (${saved.advantage === 'advantage' ? 'Advantage' : 'Disadvantage'})` : ''}
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
                                    {diceType === 20 && advantage !== 'normal' ?
                                        ` (${advantage === 'advantage' ? 'Advantage' : 'Disadvantage'})` : ''}
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
                                    <button
                                        tabIndex={-1}
                                        className="text-xs bg-accent/20 hover:bg-accent/40 px-2 py-1 rounded-md"
                                    >
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
                                <li>Natural 1: Critical Miss</li>
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
        </>
	);
};

export default DiceRoller;