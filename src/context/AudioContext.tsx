import React, { createContext, useContext } from 'react';

interface AudioContextType {
  playSound: (id: string) => void;
  isEnabled: boolean;
  toggleAudio: () => void;
}

const AudioContext = createContext<AudioContextType>({
  playSound: () => {},
  isEnabled: false,
  toggleAudio: () => {},
});

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const playSound = () => {};
  const toggleAudio = () => {};

  return (
    <AudioContext.Provider value={{ playSound, isEnabled: false, toggleAudio }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);