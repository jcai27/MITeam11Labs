import { Scenario, DialogueMode } from '../types';

interface ControlPanelProps {
  scenarios: Scenario[];
  selectedScenario: string | null;
  onScenarioChange: (scenarioId: string) => void;
  onModeChange: (mode: DialogueMode) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  mode: DialogueMode;
  onUserSpeechStart: () => void; // Add prop for starting speech recognition
  onUserSpeechStop: () => void; // Add prop for stopping speech recognition
}

export function ControlPanel({
  scenarios,
  selectedScenario,
  onScenarioChange,
  onModeChange,
  onStart,
  onPause,
  onResume,
  onStop,
  isPlaying,
  isPaused,
  mode,
  onUserSpeechStart,
  onUserSpeechStop,
}: ControlPanelProps) {
  return (
    <div className="w-full max-w-6xl mx-auto bg-gray-800 rounded-lg p-6 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Scenario
          </label>
          <select
            value={selectedScenario || ''}
            onChange={(e) => onScenarioChange(e.target.value)}
            disabled={isPlaying}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select a scenario</option>
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mode
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => onModeChange('scripted')}
              disabled={isPlaying}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === 'scripted'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Scripted
            </button>
            <button
              onClick={() => onModeChange('ai')}
              disabled={isPlaying}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === 'ai'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              AI
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Controls
          </label>
          <div className="flex space-x-2">
            {!isPlaying ? (
              <button
                onClick={onStart}
                disabled={!selectedScenario}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    onClick={onPause}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={onResume}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Resume
                  </button>
                )}
                <button
                  onClick={onStop}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Stop
                </button>
              </>
            )}
          </div>
          {isPlaying && mode === 'ai' && (
            <div className="flex space-x-2 mt-2">
              <button
                onClick={onUserSpeechStart}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Start Listening
              </button>
              <button
                onClick={onUserSpeechStop}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Stop Listening
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedScenario && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <p className="text-gray-300 text-sm">
            {scenarios.find((s) => s.id === selectedScenario)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
