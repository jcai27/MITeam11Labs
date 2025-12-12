import { useState, useEffect } from 'react';
import { VideoGrid } from './components/VideoGrid';
import { ControlPanel } from './components/ControlPanel';
import { supabase } from './lib/supabase';
import { dialogueController } from './services/DialogueController';
import { Participant, Scenario, DialogueLine, DialogueMode } from './types';

function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [mode, setMode] = useState<DialogueMode>('scripted');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
    setupDialogueListeners();

    return () => {
      dialogueController.off('lineStart', handleLineStart);
      dialogueController.off('lineEnd', handleLineEnd);
      dialogueController.off('complete', handleComplete);
      dialogueController.off('pause', handlePause);
      dialogueController.off('resume', handleResume);
      dialogueController.off('stop', handleStop);
    };
  }, []);

  useEffect(() => {
    if (selectedScenario) {
      loadDialogueLines(selectedScenario);
    }
  }, [selectedScenario]);

  const loadInitialData = async () => {
    try {
      const [participantsResult, scenariosResult] = await Promise.all([
        supabase.from('participants').select('*').order('role'),
        supabase.from('scenarios').select('*').order('name'),
      ]);

      if (participantsResult.data) {
        setParticipants(participantsResult.data);
      }

      if (scenariosResult.data) {
        setScenarios(scenariosResult.data);
        if (scenariosResult.data.length > 0) {
          setSelectedScenario(scenariosResult.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDialogueLines = async (scenarioId: string) => {
    try {
      const { data, error } = await supabase
        .from('dialogue_lines')
        .select('*')
        .eq('scenario_id', scenarioId)
        .order('order_index');

      if (error) throw error;

      if (data) {
        setDialogueLines(data);
      }
    } catch (error) {
      console.error('Error loading dialogue lines:', error);
    }
  };

  const setupDialogueListeners = () => {
    dialogueController.on('lineStart', handleLineStart);
    dialogueController.on('lineEnd', handleLineEnd);
    dialogueController.on('complete', handleComplete);
    dialogueController.on('pause', handlePause);
    dialogueController.on('resume', handleResume);
    dialogueController.on('stop', handleStop);
  };

  const handleLineStart = (data: any) => {
    setActiveSpeaker(data.speaker);
    setCurrentText(data.text);
  };

  const handleLineEnd = () => {
    setActiveSpeaker(null);
    setCurrentText('');
  };

  const handleComplete = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSpeaker(null);
    setCurrentText('');
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSpeaker(null);
    setCurrentText('');
  };

  const handleStart = async () => {
    if (!selectedScenario || participants.length === 0) return;

    setIsPlaying(true);
    setIsPaused(false);

    if (mode === 'scripted') {
      await dialogueController.startSimulation(mode, participants, dialogueLines);
    } else {
      await dialogueController.startSimulation(mode, participants);
    }
  };

  const handlePauseClick = () => {
    dialogueController.pause();
  };

  const handleResumeClick = () => {
    dialogueController.resume();
  };

  const handleStopClick = () => {
    dialogueController.stop();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading courtroom simulation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Virtual Courtroom Simulation
          </h1>
          <p className="text-gray-400">
            Experience realistic courtroom proceedings with AI-powered voices
          </p>
        </header>

        <div className="space-y-6">
          <VideoGrid
            participants={participants}
            activeSpeaker={activeSpeaker}
            currentText={currentText}
          />

          <ControlPanel
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            onScenarioChange={setSelectedScenario}
            onModeChange={setMode}
            onStart={handleStart}
            onPause={handlePauseClick}
            onResume={handleResumeClick}
            onStop={handleStopClick}
            isPlaying={isPlaying}
            isPaused={isPaused}
            mode={mode}
          />
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Powered by ElevenLabs for voice synthesis and OpenAI for AI dialogue generation
          </p>
          <p className="mt-2">
            Configure your API keys in the .env file to enable full functionality
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
