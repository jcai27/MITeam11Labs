import { DialogueLine, Participant, DialogueMode } from '../types';
import { elevenLabsService } from './elevenlabs';
import { openAIService } from './openai';

export class DialogueController {
  private audioElement: HTMLAudioElement | null = null;
  private currentLineIndex: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private mode: DialogueMode = 'scripted';
  private listeners: Map<string, Set<Function>> = new Map();
  private dialogueHistory: string[] = [];
  private speechRecognition: SpeechRecognition | null = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.addEventListener('ended', () => this.handleAudioEnded());

    // Initialize SpeechRecognition (using webkitSpeechRecognition for broader compatibility)
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.emit('userSpeechRecognized', transcript);
        this.dialogueHistory.push(`You: ${transcript}`);
        console.log('User said:', transcript);
        // Immediately trigger AI response after user speaks
        this.playAIDialogue([]); // Participants will be fetched from the App.tsx state
      };

      this.speechRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.emit('userSpeechError', event.error);
      };
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
  }

  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  async startSimulation(
    mode: DialogueMode,
    participants: Participant[],
    dialogueLines?: DialogueLine[]
  ) {
    this.mode = mode;
    this.currentLineIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;
    this.dialogueHistory = [];
    this.emit('start', { mode });

    if (mode === 'scripted' && dialogueLines) {
      await this.playScriptedDialogue(dialogueLines, participants);
    } else if (mode === 'ai') {
      await this.playAIDialogue(participants);
    }
  }

  startUserSpeechRecognition() {
    if (this.speechRecognition && this.mode === 'ai') {
      this.speechRecognition.start();
      this.emit('userSpeechStart');
      console.log('Listening for user input...');
    }
  }

  stopUserSpeechRecognition() {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.emit('userSpeechStop');
      console.log('Stopped listening for user input.');
    }
  }

  private async playScriptedDialogue(dialogueLines: DialogueLine[], participants: Participant[]) {
    const sortedLines = [...dialogueLines].sort((a, b) => a.order_index - b.order_index);

    for (let i = 0; i < sortedLines.length; i++) {
      if (!this.isPlaying) break;

      while (this.isPaused) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const line = sortedLines[i];
      const participant = participants.find((p) => p.role === line.participant_role);

      if (participant) {
        this.currentLineIndex = i;
        await this.speakLine(line.text, participant);
      }
    }

    if (this.isPlaying) {
      this.emit('complete');
      this.isPlaying = false;
    }
  }

  private async playAIDialogue(participants: Participant[]) {
    const maxTurns = 12;
    let turnCount = 0;

    while (turnCount < maxTurns && this.isPlaying) {
      while (this.isPaused) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // If it's the user's turn or we need user input, activate speech recognition
      if (this.mode === 'ai' && turnCount % (participants.length + 1) === participants.length) {
        this.emit('activeSpeaker', 'user');
        this.startUserSpeechRecognition();
        await new Promise<void>((resolve) => {
          const onSpeechRecognized = (transcript: string) => {
            this.stopUserSpeechRecognition();
            this.emit('lineEnd', { speaker: 'user' });
            resolve();
          };
          this.on('userSpeechRecognized', onSpeechRecognized);
          // Remove listener after resolution to prevent multiple calls
          // This is a simplified approach; in a real app, you might manage listeners more robustly
          this.on('userSpeechStop', () => this.off('userSpeechRecognized', onSpeechRecognized));
        });
        turnCount++;
        continue; // Skip AI agent turn for this round as user just spoke
      }

      const participantIndex = turnCount % participants.length;
      const participant = participants[participantIndex];

      const context = this.getContextForRole(participant.role);
      const dialogue = await openAIService.generateDialogue(
        participant.name, // Use participant.name instead of participant.display_name
        participant.persona,
        context,
        this.dialogueHistory
      );

      if (!this.isPlaying) break;

      this.dialogueHistory.push(`${participant.name}: ${dialogue}`);
      await this.speakLine(dialogue, participant);

      turnCount++;
    }

    if (this.isPlaying) {
      this.emit('complete');
      this.isPlaying = false;
    }
  }

  private getContextForRole(role: string): string[] {
    const contexts: Record<string, string[]> = {
      judge: [
        'You are presiding over a courtroom proceeding.',
        'Maintain order and ensure proper legal procedure.',
      ],
      defense: [
        'You are representing the defendant in this case.',
        'Present a strong, logical defense.',
      ],
      jury: [
        'You are part of the jury evaluating this case.',
        'Provide thoughtful, impartial observations.',
      ],
    };

    return contexts[role] || ['Participate in the courtroom proceedings.'];
  }

  private async speakLine(text: string, participant: Participant): Promise<void> {
    return new Promise(async (resolve) => {
      this.emit('lineStart', {
        text,
        speaker: participant.role,
        participantName: participant.display_name,
      });

      try {
        const audioBlob = await elevenLabsService.synthesizeSpeech(text, participant.voice_id);
        const audioUrl = URL.createObjectURL(audioBlob);

        if (!this.audioElement) {
          this.audioElement = new Audio();
        }

        this.audioElement.src = audioUrl;
        this.audioElement.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.emit('lineEnd', { speaker: participant.role });
          resolve();
        };

        this.audioElement.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          this.emit('lineEnd', { speaker: participant.role });
          resolve();
        };

        await this.audioElement.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        this.emit('lineEnd', { speaker: participant.role });
        resolve();
      }
    });
  }

  private handleAudioEnded() {
    this.emit('audioEnded');
  }

  pause() {
    this.isPaused = true;
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    this.emit('pause');
  }

  resume() {
    this.isPaused = false;
    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play();
    }
    this.emit('resume');
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    this.emit('stop');
  }

  getState() {
    return {
      currentLineIndex: this.currentLineIndex,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      mode: this.mode,
    };
  }
}

export const dialogueController = new DialogueController();
