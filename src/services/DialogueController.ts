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

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.addEventListener('ended', () => this.handleAudioEnded());
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

      const participantIndex = turnCount % participants.length;
      const participant = participants[participantIndex];

      const context = this.getContextForRole(participant.role);
      const dialogue = await openAIService.generateDialogue(
        participant.display_name,
        participant.persona,
        context,
        this.dialogueHistory
      );

      if (!this.isPlaying) break;

      this.dialogueHistory.push(`${participant.display_name}: ${dialogue}`);
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
