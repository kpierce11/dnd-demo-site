import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { Dice1 as DiceD20Icon, Info, Plus, X } from 'lucide-react';
import DiceBox from '@3d-dice/dice-box';

interface CustomDiceResult {
	type: number;
	value: number;
	id: string;
    selected?: boolean; // Added a flag to indicate if this die was selected for the total
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


	useEffect(() => {
		console.log("Starting DiceBox initialization (Full Screen)...");

		// Clean up previous DiceBox instance if it exists
		if (diceBoxRef.current) {
			try {
				if (diceBoxRef.current && typeof diceBoxRef.current.clear === 'function') {
					diceBoxRef.current.clear();
				}
				if (diceBoxRef.current && typeof diceBoxRef.current.dispose === 'function') {
					diceBoxRef.current.dispose();
				} else if (diceBoxRef.current && typeof diceBoxRef.current.destroy === 'function') {
					diceBoxRef.current.destroy();
				}
			} catch (e) {
				console.warn("Error cleaning up previous DiceBox instance:", e);
			}
			diceBoxRef.current = null;
		}

		const diceCanvasId = 'dice-box-fullscreen-canvas';

        // Rely on DiceBox configuration to create and manage the canvas in the body.
        // Manual canvas creation and appending is removed from this effect.


		try {
			const config = {
				container: 'body', // DiceBox will look for or create the canvas in the body
				assetPath: '/assets/dice-box/',
				theme: 'default',
				scale: 20,
				gravity: 1,
				throwForce: 6,
				spinForce: 3,
				lightIntensity: 0.8,
				shadowTransparency: 0.8,
				id: diceCanvasId, // DiceBox will use this ID for the canvas
			};

			console.log("Creating new DiceBox with config:", config);

			const newDiceBox = new DiceBox(config);
			diceBoxRef.current = newDiceBox;

			console.log("Initializing DiceBox...");
			newDiceBox.init()
				.then(() => {
					console.log("DiceBox initialized successfully!");

                    // Get the canvas element after DiceBox has initialized it
                    const diceCanvas = document.getElementById(diceCanvasId) as HTMLCanvasElement | null;

					if (diceCanvas) {
						console.log("Found dice canvas after initialization, applying initial styles and attempting resolution.");

						// Apply basic styles that might not be in global CSS or need re-applying
                        // Full-screen position/size/z-index should be handled by global CSS on #dice-box-fullscreen-canvas
						diceCanvas.style.pointerEvents = 'none'; // Initially no pointer events

                        // Attempt to set canvas resolution attributes using requestAnimationFrame
                        // This might help time it better with the browser's rendering loop and OffscreenCanvas
                        requestAnimationFrame(() => {
                             const canvasToResize = document.getElementById(diceCanvasId) as HTMLCanvasElement | null;
                             if (canvasToResize) {
                                 const windowWidth = window.innerWidth;
                                 const windowHeight = window.innerHeight;
                                 canvasToResize.width = windowWidth;
                                 canvasToResize.height = windowHeight;
                                  console.log(`Attempted to set canvas resolution attributes with rAF after init to ${windowWidth}x${windowHeight}`);
                                  // Call resize method here again after setting attributes, as per library suggestion
                                  if (diceBoxRef.current && typeof diceBoxRef.current.resize === 'function') {
                                        console.log(`Attempting to resize DiceBox via resize method after rAF attribute set.`);
                                        diceBoxRef.current.resize(windowWidth, windowHeight);
                                    }
                             }
                        });

					} else {
						console.warn(`Dice canvas with ID '${diceCanvasId}' not found after DiceBox initialization.`);
					}


					if (diceBoxRef.current && typeof diceBoxRef.current.resize === 'function') {
						console.log(`Attempting to resize DiceBox via resize method immediately after init.`);
                         // Call resize immediately after init as well
                        diceBoxRef.current.resize(window.innerWidth, window.innerHeight);
					} else {
						console.warn("DiceBox resize method not found or supported.");
					}

					setIsDiceBoxReady(true);
				})
				.catch((error) => {
					console.error("Failed to initialize DiceBox:", error);
					setIsDiceBoxReady(false);
				});
		} catch (error) {
			console.error("Error creating DiceBox:", error);
			setIsDiceBoxReady(false);
		}

		const handleResize = () => {
			const diceCanvas = document.getElementById(diceCanvasId) as HTMLCanvasElement | null;

			if (diceCanvas && diceCanvas instanceof HTMLCanvasElement) {
				console.log("Window resized, found dice canvas");
				const windowWidth = window.innerWidth;
				const windowHeight = window.innerHeight;

				// Update canvas resolution on resize using requestAnimationFrame
                 requestAnimationFrame(() => {
                     const canvasToResize = document.getElementById(diceCanvasId) as HTMLCanvasElement | null;
                     if (canvasToResize) {
                         canvasToResize.width = windowWidth;
                         canvasToResize.height = windowHeight;
                         console.log(`Updated canvas resolution attributes on resize with rAF to ${windowWidth}x${windowHeight}`);
                         // Call resize method after setting attributes, as per library suggestion
                         if (diceBoxRef.current && typeof diceBoxRef.current.resize === 'function') {
                                console.log(`Attempting to resize DiceBox via resize method after rAF attribute set on resize.`);
                                diceBoxRef.current.resize(windowWidth, windowHeight);
                            }
                     }
                 });


				if (diceBoxRef.current && typeof diceBoxRef.current.resize === 'function') {
					console.log(`Attempting to resize DiceBox via resize method immediately on resize.`);
                    diceBoxRef.current.resize(windowWidth, windowHeight);
				} else {
					console.warn("DiceBox resize method not found or supported.");
				}
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);

            // Clean up DiceBox instance
			if (diceBoxRef.current) {
				try {
					if (diceBoxRef.current && typeof diceBoxRef.current.clear === 'function') {
				        console.log("Cleaning up DiceBox instance.");
						diceBoxRef.current.clear();
					}
					if (diceBoxRef.current && typeof diceBoxRef.current.dispose === 'function') {
						diceBoxRef.current.dispose();
					} else if (diceBoxRef.current && typeof diceBoxRef.current.destroy === 'function') {
						diceBoxRef.current.destroy();
					}
				} catch (e) {
					console.warn("Error disposing of DiceBox instance:", e);
				}
			}

            // Clean up the canvas element if DiceBox created it in the body
			const diceCanvas = document.getElementById(diceCanvasId);
			if (diceCanvas && diceCanvas.parentNode === document.body) {
				console.log("Removing DiceBox canvas from body during cleanup:", diceCanvas);
				document.body.removeChild(diceCanvas);
			}

			diceBoxRef.current = null;
		};
	}, []);


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

            const diceCanvas = document.getElementById('dice-box-fullscreen-canvas');
            if (diceCanvas) {
                diceCanvas.style.pointerEvents = 'none';
            }
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
		setShowDice(true);
		playSound('diceRoll');

		const numDice = customRoll?.dice || numberOfDice;
		const typeOfDice = customRoll?.diceType || diceType;
		const currentModifier = customRoll?.modifier || modifier;
		const currentAdvantage = customRoll?.advantage || advantage;

        const diceCanvas = document.getElementById('dice-box-fullscreen-canvas');
        if (diceCanvas) {
            diceCanvas.style.pointerEvents = 'auto';
        }

		try {
			let notation;
			if (typeOfDice === 20 && currentAdvantage !== 'normal') {
				// Always roll 2d20 for advantage/disadvantage
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
                // Handle advantage/disadvantage for 2d20 rolls
                const sortedResults = [...rollResults].sort((a: any, b: any) => a.value - b.value);
                const selectedDie = currentAdvantage === 'advantage' ? sortedResults[1] : sortedResults[0]; // Index 1 for highest, 0 for lowest

                calculatedTotal = selectedDie.value + currentModifier;

                processedResults = rollResults.map((d: any) => ({ // Use original rollResults order for display
                    type: d.sides,
                    value: d.value,
                    id: d.id, // Use original ID
                    selected: d.id === selectedDie.id // Mark the selected die by comparing original ID
                }));

            } else {
                // Standard roll
                const sumOfDice = rollResults.reduce((sum: number, die: any) => sum + die.value, 0);
                calculatedTotal = sumOfDice + currentModifier;

                processedResults = rollResults.map((d: any) => ({
                    type: d.sides,
                    value: d.value,
                    id: d.id, // Use original ID
                    selected: true // All dice are "selected" in a normal roll
                }));
            }


			setTotal(calculatedTotal);
			setDiceResults(processedResults);


            diceBoxRef.current.onRollComplete = (results: any) => {
                console.log("Roll complete:", results);
                playSound('success');
                setIsRolling(false);
                // Start timer to hide dice after 1 second
                setTimeout(() => {
                    setShowDice(false);
                    const diceCanvas = document.getElementById('dice-box-fullscreen-canvas');
                    if (diceCanvas) {
                        diceCanvas.style.pointerEvents = 'none';
                    }
					if (diceBoxRef.current) {
						console.log("Clearing dice after timeout.");
						diceBoxRef.current.clear();
					}
                }, 1000);
            };

		} catch (error) {
			console.error("Error rolling with DiceBox:", error);
			setIsRolling(false);
            setShowDice(false);
            const diceCanvas = document.getElementById('dice-box-fullscreen-canvas');
            if (diceCanvas) {
                diceCanvas.style.pointerEvents = 'none';
            }
        }
	};

	const getResultsString = () => {
        if (diceResults.length === 0) return total !== null ? "Processing..." : "";

        if (diceType === 20 && (advantage === 'advantage' || advantage === 'disadvantage') && diceResults.length >= 2) {
             // For advantage/disadvantage, show both dice and indicate the selected one
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

    // Effect to set number of dice to 1 when advantage/disadvantage is selected
    useEffect(() => {
        if (diceType === 20 && advantage !== 'normal') {
            setNumberOfDice(1);
        }
    }, [diceType, advantage]);


	return (
		<div className="max-w-6xl mx-auto relative z-20">
			{/* Overlay div to capture clicks when result is visible and not rolling */}
            {total !== null && !isRolling && showDice && (
                <div
                    className="fixed inset-0 z-[999] cursor-pointer"
                    onClick={handleOverlayClick}
					aria-hidden="true"
                ></div>
            )}

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="magical-card mb-8 p-6 md:p-8 flex flex-col flex-grow"
			>
				<h1 className="text-3xl font-bold text-center mb-6 glow-text">Dice Roller</h1>

				<div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
					{/* Number of Dice */}
					<div>
						<label htmlFor="numDice" className="block mb-1 font-bold">Number of Dice</label>
						<select
							id="numDice"
							value={numberOfDice}
							onChange={(e) => setNumberOfDice(parseInt(e.target.value) || 1)}
							className="w-full p-2 bg-muted/50 rounded-md"
                            disabled={diceType === 20 && advantage !== 'normal'} // Disable if advantage/disadvantage is on
						>
                            {/* Conditionally render options */}
                            {diceType === 20 && advantage !== 'normal' ? (
                                <option value={1}>1</option>
                            ) : (
                                numberOfDiceOptions.map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))
                            )}
						</select>
					</div>

					{/* Type of Dice */}
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
                                    // If switching to d20, ensure number of dice is 1 if advantage/disadvantage is on
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

					{/* Modifier */}
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

				{/* Advantage/Disadvantage Toggle (only for d20) */}
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
									X size={14} />
								</button>

								<div onClick={() => handleUseSavedRoll(saved)} className="cursor-pointer">
									<h4 className="font-bold">{saved.name}</h4>
									<p className="text-sm text-foreground/70">
										{saved.dice}d{saved.diceType}
										{saved.modifier !== 0 ? (saved.modifier > 0 ? `+${saved.modifier}` : modifier) : ''}
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
							<h3 className="text-xl font-bold mb-4">Save Roll Configuration