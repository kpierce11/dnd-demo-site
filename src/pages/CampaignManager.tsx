import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { Map, Plus, Trash2, Edit, Users, Calendar, BookOpen, X, Save, PlusCircle } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  players: string[];
  nextSession: string;
  currentQuest: string;
}

interface Session {
  id: string;
  campaignId: string;
  date: string;
  title: string;
  notes: string;
}

export const CampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'c1',
      name: 'The Curse of Strahd',
      description: 'A gothic horror campaign set in the mist-shrouded land of Barovia.',
      players: ['John (Theren, Elf Ranger)', 'Emily (Isolde, Human Cleric)', 'Mike (Grog, Half-Orc Barbarian)', 'Sarah (Elaria, Tiefling Warlock)'],
      nextSession: '2023-04-15T19:00',
      currentQuest: 'The party is heading to Castle Ravenloft to confront Count Strahd von Zarovich.'
    },
    {
      id: 'c2',
      name: 'Storm King\'s Thunder',
      description: 'Giants have emerged from their strongholds to threaten civilization as never before.',
      players: ['Chris (Varis, Human Fighter)', 'Alex (Zephyr, Air Genasi Monk)', 'Jess (Miri, Halfling Rogue)'],
      nextSession: '2023-04-20T18:30',
      currentQuest: 'The party must find the storm giant king Hekaton, who has gone missing.'
    }
  ]);
  
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 's1',
      campaignId: 'c1',
      date: '2023-03-18',
      title: 'Into the Mists',
      notes: 'The party arrived in Barovia and encountered a mysterious fortune teller named Madam Eva.'
    },
    {
      id: 's2',
      campaignId: 'c1',
      date: '2023-04-01',
      title: 'The Village of Barovia',
      notes: 'The party explored the village of Barovia and encountered Ireena Kolyana, who is being targeted by Strahd.'
    },
    {
      id: 's3',
      campaignId: 'c2',
      date: '2023-03-23',
      title: 'Giant Attack',
      notes: 'The party defended the town of Nightstone from stone giants.'
    }
  ]);
  
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [newSession, setNewSession] = useState<Partial<Session> | null>(null);
  
  const { playSound } = useAudio();
  
  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditingCampaign(null);
    setNewSession(null);
    playSound('click');
  };
  
  const handleEditCampaign = () => {
    if (selectedCampaign) {
      setEditingCampaign({...selectedCampaign});
    }
    playSound('click');
  };
  
  const handleSaveCampaign = () => {
    if (editingCampaign) {
      setCampaigns(campaigns.map(c => 
        c.id === editingCampaign.id ? editingCampaign : c
      ));
      setSelectedCampaign(editingCampaign);
      setEditingCampaign(null);
      playSound('success');
    }
  };
  
  const handleCancelEdit = () => {
    setEditingCampaign(null);
    playSound('click');
  };
  
  const handleDeleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    if (selectedCampaign?.id === id) {
      setSelectedCampaign(null);
    }
    playSound('click');
  };
  
  const handleCreateCampaign = () => {
    setShowNewCampaignForm(true);
    setSelectedCampaign(null);
    setEditingCampaign(null);
    playSound('click');
  };
  
  const handleSaveNewCampaign = () => {
    if (editingCampaign && editingCampaign.name) {
      const newCampaign = {
        ...editingCampaign,
        id: `c${Date.now()}`,
        players: editingCampaign.players || [],
      };
      
      setCampaigns([...campaigns, newCampaign]);
      setSelectedCampaign(newCampaign);
      setEditingCampaign(null);
      setShowNewCampaignForm(false);
      playSound('success');
    }
  };
  
  const handleCancelNewCampaign = () => {
    setShowNewCampaignForm(false);
    setEditingCampaign(null);
    playSound('click');
  };
  
  const handleCreateSession = () => {
    if (selectedCampaign) {
      setNewSession({
        campaignId: selectedCampaign.id,
        date: new Date().toISOString().split('T')[0],
        title: '',
        notes: ''
      });
      playSound('click');
    }
  };
  
  const handleSaveNewSession = () => {
    if (newSession && newSession.title && newSession.date) {
      const session = {
        id: `s${Date.now()}`,
        campaignId: newSession.campaignId || '',
        date: newSession.date || '',
        title: newSession.title || '',
        notes: newSession.notes || ''
      };
      
      setSessions([...sessions, session]);
      setNewSession(null);
      playSound('success');
    }
  };
  
  const handleCancelNewSession = () => {
    setNewSession(null);
    playSound('click');
  };
  
  const handleEditingChange = (field: keyof Campaign, value: string) => {
    if (editingCampaign) {
      setEditingCampaign({
        ...editingCampaign,
        [field]: value
      });
    }
  };
  
  const handleEditingPlayerChange = (index: number, value: string) => {
    if (editingCampaign) {
      const updatedPlayers = [...editingCampaign.players];
      updatedPlayers[index] = value;
      setEditingCampaign({
        ...editingCampaign,
        players: updatedPlayers
      });
    }
  };
  
  const handleAddPlayer = () => {
    if (editingCampaign) {
      setEditingCampaign({
        ...editingCampaign,
        players: [...editingCampaign.players, '']
      });
    }
  };
  
  const handleRemovePlayer = (index: number) => {
    if (editingCampaign) {
      const updatedPlayers = [...editingCampaign.players];
      updatedPlayers.splice(index, 1);
      setEditingCampaign({
        ...editingCampaign,
        players: updatedPlayers
      });
    }
  };
  
  const handleNewSessionChange = (field: keyof Session, value: string) => {
    if (newSession) {
      setNewSession({
        ...newSession,
        [field]: value
      });
    }
  };
  
  const getCampaignSessions = (campaignId: string) => {
    return sessions.filter(session => session.campaignId === campaignId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    
    // Check if the date includes time
    const date = dateString.includes('T') 
      ? new Date(dateString) 
      : new Date(`${dateString}T00:00`);
      
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="magical-card p-6 mb-8"
      >
        <h1 className="text-3xl font-bold text-center mb-6 glow-text">Campaign Manager</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Campaign List */}
          <div className="w-full md:w-1/3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Campaigns</h2>
              <button 
                className="bg-primary hover:bg-primary/80 text-white rounded-full p-1"
                onClick={handleCreateCampaign}
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              {campaigns.length > 0 ? (
                campaigns.map(campaign => (
                  <div 
                    key={campaign.id}
                    className={`magical-card p-4 cursor-pointer transition-all hover:ring-1 hover:ring-primary ${
                      selectedCampaign?.id === campaign.id ? 'ring-2 ring-accent' : ''
                    }`}
                    onClick={() => handleCampaignClick(campaign)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-bold">{campaign.name}</h3>
                      <button 
                        className="text-foreground/50 hover:text-error transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCampaign(campaign.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-foreground/70 line-clamp-2 mt-1">{campaign.description}</p>
                    <div className="flex items-center mt-2 text-xs text-foreground/60">
                      <Users size={14} className="mr-1" />
                      <span>{campaign.players.length} players</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-muted/20 rounded-lg">
                  <Map size={40} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-foreground/70">No campaigns yet. Create one to get started!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Campaign Details / Edit Form */}
          <div className="w-full md:w-2/3">
            {showNewCampaignForm ? (
              <div className="magical-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Create New Campaign</h2>
                  <button 
                    className="text-foreground/50 hover:text-foreground transition-colors"
                    onClick={handleCancelNewCampaign}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <CampaignForm
                  campaign={{
                    id: '',
                    name: '',
                    description: '',
                    players: [],
                    nextSession: '',
                    currentQuest: ''
                  }}
                  setEditingCampaign={setEditingCampaign}
                  handleSave={handleSaveNewCampaign}
                  handleAddPlayer={handleAddPlayer}
                  handleRemovePlayer={handleRemovePlayer}
                  handleEditingChange={handleEditingChange}
                  handleEditingPlayerChange={handleEditingPlayerChange}
                />
              </div>
            ) : editingCampaign ? (
              <div className="magical-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Edit Campaign</h2>
                  <button 
                    className="text-foreground/50 hover:text-foreground transition-colors"
                    onClick={handleCancelEdit}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <CampaignForm
                  campaign={editingCampaign}
                  setEditingCampaign={setEditingCampaign}
                  handleSave={handleSaveCampaign}
                  handleAddPlayer={handleAddPlayer}
                  handleRemovePlayer={handleRemovePlayer}
                  handleEditingChange={handleEditingChange}
                  handleEditingPlayerChange={handleEditingPlayerChange}
                />
              </div>
            ) : selectedCampaign ? (
              <div className="magical-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{selectedCampaign.name}</h2>
                  <button 
                    className="bg-primary/20 hover:bg-primary/30 text-foreground p-1 rounded-full transition-colors"
                    onClick={handleEditCampaign}
                  >
                    <Edit size={18} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-foreground/70 mb-4">{selectedCampaign.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar size={18} className="text-accent mr-2" />
                        <h3 className="font-bold">Next Session</h3>
                      </div>
                      <p className="text-foreground/70">
                        {selectedCampaign.nextSession 
                          ? formatDate(selectedCampaign.nextSession) 
                          : 'No session scheduled'}
                      </p>
                    </div>
                    
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <BookOpen size={18} className="text-accent mr-2" />
                        <h3 className="font-bold">Current Quest</h3>
                      </div>
                      <p className="text-foreground/70">
                        {selectedCampaign.currentQuest || 'No active quest'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <Users size={18} className="text-accent mr-2" />
                      <h3 className="font-bold">Players</h3>
                    </div>
                    {selectedCampaign.players.length > 0 ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedCampaign.players.map((player, index) => (
                          <li key={index} className="text-sm bg-muted/20 p-2 rounded-md">
                            {player}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-foreground/70">No players added yet</p>
                    )}
                  </div>
                </div>
                
                {/* Session History */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">Session History</h3>
                    <button 
                      className="flex items-center gap-1 text-sm bg-secondary/30 hover:bg-secondary/50 py-1 px-2 rounded-md transition-colors"
                      onClick={handleCreateSession}
                    >
                      <Plus size={14} />
                      <span>Add Session</span>
                    </button>
                  </div>
                  
                  {newSession && (
                    <div className="mb-4 bg-primary/10 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold">New Session</h4>
                        <button 
                          className="text-foreground/50 hover:text-foreground transition-colors"
                          onClick={handleCancelNewSession}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm mb-1">Date</label>
                          <input 
                            type="date" 
                            className="w-full p-2 bg-muted/50 rounded-md"
                            value={newSession.date}
                            onChange={(e) => handleNewSessionChange('date', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm mb-1">Title</label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-muted/50 rounded-md"
                            value={newSession.title}
                            placeholder="Session title"
                            onChange={(e) => handleNewSessionChange('title', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm mb-1">Notes</label>
                          <textarea
                            className="w-full p-2 bg-muted/50 rounded-md min-h-[100px]"
                            value={newSession.notes}
                            placeholder="What happened in this session?"
                            onChange={(e) => handleNewSessionChange('notes', e.target.value)}
                          />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <button
                            className="bg-muted hover:bg-muted/70 text-foreground py-1 px-3 rounded-md text-sm"
                            onClick={handleCancelNewSession}
                          >
                            Cancel
                          </button>
                          <button
                            className="bg-primary hover:bg-primary/80 text-white py-1 px-3 rounded-md text-sm flex items-center gap-1"
                            onClick={handleSaveNewSession}
                            disabled={!newSession.title || !newSession.date}
                          >
                            <Save size={14} />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {getCampaignSessions(selectedCampaign.id).length > 0 ? (
                      getCampaignSessions(selectedCampaign.id).map(session => (
                        <div key={session.id} className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold">{session.title}</h4>
                            <span className="text-xs text-foreground/60">{formatDate(session.date)}</span>
                          </div>
                          <p className="text-sm text-foreground/70">{session.notes}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-4 text-foreground/70 bg-muted/20 rounded-lg">
                        No sessions recorded yet. Add your first session log!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="magical-card p-8 flex flex-col items-center justify-center text-center h-full">
                <Map size={60} className="mb-4 text-muted-foreground" />
                <h2 className="text-xl font-bold mb-2">No Campaign Selected</h2>
                <p className="text-foreground/70 mb-4">Select a campaign from the list or create a new one to begin your adventure!</p>
                <button 
                  className="bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300"
                  onClick={handleCreateCampaign}
                >
                  <Plus size={18} />
                  <span>Create Campaign</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface CampaignFormProps {
  campaign: Campaign;
  setEditingCampaign: React.Dispatch<React.SetStateAction<Campaign | null>>;
  handleSave: () => void;
  handleAddPlayer: () => void;
  handleRemovePlayer: (index: number) => void;
  handleEditingChange: (field: keyof Campaign, value: string) => void;
  handleEditingPlayerChange: (index: number, value: string) => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  campaign,
  setEditingCampaign,
  handleSave,
  handleAddPlayer,
  handleRemovePlayer,
  handleEditingChange,
  handleEditingPlayerChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 font-bold">Campaign Name</label>
        <input 
          type="text" 
          className="w-full p-2 bg-muted/50 rounded-md"
          value={campaign.name}
          onChange={(e) => handleEditingChange('name', e.target.value)}
          placeholder="Enter campaign name"
        />
      </div>
      
      <div>
        <label className="block mb-1 font-bold">Description</label>
        <textarea 
          className="w-full p-2 bg-muted/50 rounded-md min-h-[100px]"
          value={campaign.description}
          onChange={(e) => handleEditingChange('description', e.target.value)}
          placeholder="Describe your campaign"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-bold">Next Session Date</label>
          <input 
            type="datetime-local" 
            className="w-full p-2 bg-muted/50 rounded-md"
            value={campaign.nextSession}
            onChange={(e) => handleEditingChange('nextSession', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block mb-1 font-bold">Current Quest</label>
          <input 
            type="text" 
            className="w-full p-2 bg-muted/50 rounded-md"
            value={campaign.currentQuest}
            onChange={(e) => handleEditingChange('currentQuest', e.target.value)}
            placeholder="What are the players currently doing?"
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-bold">Players</label>
          <button 
            className="text-accent hover:text-accent/80 flex items-center gap-1 text-sm"
            onClick={handleAddPlayer}
          >
            <PlusCircle size={16} />
            <span>Add Player</span>
          </button>
        </div>
        
        {campaign.players.length > 0 ? (
          <div className="space-y-2">
            {campaign.players.map((player, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-grow p-2 bg-muted/50 rounded-md"
                  value={player}
                  onChange={(e) => handleEditingPlayerChange(index, e.target.value)}
                  placeholder="Player name (Character name, Race Class)"
                />
                <button 
                  className="text-foreground/50 hover:text-error transition-colors"
                  onClick={() => handleRemovePlayer(index)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-foreground/70 mb-2">No players added yet. Add players to your campaign.</p>
        )}
      </div>
      
      <div className="pt-4 flex justify-end">
        <button
          className="bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-md flex items-center gap-2"
          onClick={handleSave}
          disabled={!campaign.name}
        >
          <Save size={18} />
          <span>Save Campaign</span>
        </button>
      </div>
    </div>
  );
};