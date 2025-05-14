import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Rules } from './pages/Rules';
import { DiceRoller } from './pages/DiceRoller';
import { CharacterBuilder } from './pages/CharacterBuilder';
import { SpellDatabase } from './pages/SpellDatabase';
import { MonsterCompendium } from './pages/MonsterCompendium';
import { CampaignManager } from './pages/CampaignManager';
import ParticleBackground from './components/ui/ParticleBackground';
import { AudioProvider } from './context/AudioContext';

function App() {
  return (
    <BrowserRouter>
      <AudioProvider>
        <ParticleBackground />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/dice-roller" element={<DiceRoller />} />
            <Route path="/character-builder" element={<CharacterBuilder />} />
            <Route path="/spells" element={<SpellDatabase />} />
            <Route path="/monsters" element={<MonsterCompendium />} />
            <Route path="/campaigns" element={<CampaignManager />} />
          </Routes>
        </Layout>
      </AudioProvider>
    </BrowserRouter>
  );
}

export default App;