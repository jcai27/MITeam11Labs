export interface Participant {
  id: string;
  role: 'judge' | 'defense' | 'jury' | 'prosecutor' | 'witness' | 'user';
  display_name: string;
  voice_id: string;
  persona: string;
  avatar_url?: string;
  created_at: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface DialogueLine {
  id: string;
  scenario_id: string;
  participant_role: 'judge' | 'defense' | 'jury' | 'prosecutor' | 'witness';
  text: string;
  order_index: number;
  created_at: string;
}

export interface DialogueState {
  currentLineIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  currentSpeaker: string | null;
  mode: 'scripted' | 'ai';
}

export type DialogueMode = 'scripted' | 'ai';
