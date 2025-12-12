import { useState, useEffect } from 'react';
import { VideoGrid } from './components/VideoGrid';
import { ControlPanel } from './components/ControlPanel';
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
  const [userStream, setUserStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Simulate loading data
    const dummyParticipants: Participant[] = [
      { id: '1', name: 'Judge', role: 'judge', avatarUrl: '/avatars/judge.png' },
      { id: '2', name: 'Prosecutor', role: 'prosecutor', avatarUrl: '/avatars/prosecutor.png' },
      { id: '3', name: 'Defense Attorney', role: 'defense', avatarUrl: '/avatars/defense.png' },
      { id: '4', name: 'Witness', role: 'witness', avatarUrl: '/avatars/witness.png' },
      { id: '5', name: 'You', role: 'user', avatarUrl: '/avatars/user.png' },
    ];

    const dummyScenarios: Scenario[] = [
      { id: '1', name: 'Opening Statements', description: 'Initial arguments from both sides.' },
      { id: '2', name: 'Witness Examination', description: 'Questioning of a witness.' },
      { id: '3', name: 'Closing Arguments', description: 'Final summaries and appeals.' },
    ];

    const dummyDialogueLines: DialogueLine[] = [
      { id: 'dl1', scenario_id: '1', speaker: 'Judge', text: 'Good morning, ladies and gentlemen. We are here today to hear the case of...' , order_index: 0 },
      { id: 'dl2', scenario_id: '1', speaker: 'Prosecutor', text: 'Your Honor, members of the jury, the evidence will show that the defendant is guilty beyond a reasonable doubt.', order_index: 1 },
      { id: 'dl3', scenario_id: '1', speaker: 'Defense Attorney', text: 'May it please the court, the defense will prove that the prosecution lacks sufficient evidence.', order_index: 2 },
    ];

    setParticipants(dummyParticipants);
    setScenarios(dummyScenarios);
    if (dummyScenarios.length > 0) {
      setSelectedScenario(dummyScenarios[0].id);
    }
    setDialogueLines(dummyDialogueLines);
    setLoading(false);

    setupDialogueListeners();
    startWebcam(); // Start webcam when component mounts

    dialogueController.on('userSpeechRecognized', handleUserSpeech);

    return () => {
      dialogueController.off('lineStart', handleLineStart);
      dialogueController.off('lineEnd', handleLineEnd);
      dialogueController.off('complete', handleComplete);
      dialogueController.off('pause', handlePause);
      dialogueController.off('resume', handleResume);
      dialogueController.off('stop', handleStop);
      dialogueController.off('userSpeechRecognized', handleUserSpeech);
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [userStream]); // Add userStream to dependency array

  useEffect(() => {
    if (selectedScenario) {
      // In a real application, this would load dialogue lines based on selectedScenario
      // For now, we use dummy data
      const dummyDialogueLines: DialogueLine[] = [
        { id: 'dl1', scenario_id: '1', speaker: 'Judge', text: 'Good morning, ladies and gentlemen. We are here today to hear the case of...' , order_index: 0 },
        { id: 'dl2', scenario_id: '1', speaker: 'Prosecutor', text: 'Your Honor, members of the jury, the evidence will show that the defendant is guilty beyond a reasonable doubt.', order_index: 1 },
        { id: 'dl3', scenario_id: '1', speaker: 'Defense Attorney', text: 'May it please the court, the defense will prove that the prosecution lacks sufficient evidence.', order_index: 2 },
      ];
      setDialogueLines(dummyDialogueLines);
    }
  }, [selectedScenario]);

  const setupDialogueListeners = () => {
    dialogueController.on('lineStart', handleLineStart);
    dialogueController.on('lineEnd', handleLineEnd);
    dialogueController.on('complete', handleComplete);
    dialogueController.on('pause', handlePause);
    dialogueController.on('resume', handleResume);
    dialogueController.on('stop', handleStop);
  };

  const handleUserSpeech = (text: string) => {
    setCurrentText(`You: ${text}`);
    setActiveSpeaker('user');
    // The DialogueController now handles the AI response internally
    // No need to call openAIService.generateDialogue here
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

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setUserStream(stream);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
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
            userStream={userStream}
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
            onUserSpeechStart={dialogueController.startUserSpeechRecognition} // Pass function down
            onUserSpeechStop={dialogueController.stopUserSpeechRecognition} // Pass function down
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
