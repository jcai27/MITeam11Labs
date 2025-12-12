const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export class ElevenLabsService {
  private apiKey: string;

  constructor() {
    this.apiKey = ELEVENLABS_API_KEY || '';
    if (this.apiKey && this.apiKey !== 'your_elevenlabs_api_key_here' && this.apiKey.trim() !== '') {
      console.log('ElevenLabs API key loaded successfully');
    } else {
      console.warn('ElevenLabs API key not found. Please set VITE_ELEVENLABS_API_KEY in your .env file.');
    }
  }

  async synthesizeSpeech(text: string, voiceId: string): Promise<Blob> {
    if (!this.apiKey || this.apiKey === 'your_elevenlabs_api_key_here' || this.apiKey.trim() === '') {
      console.warn('ElevenLabs API key not configured. Using mock audio. Please set VITE_ELEVENLABS_API_KEY in your .env file.');
      return this.generateMockAudio(text);
    }

    if (!voiceId || voiceId.trim() === '') {
      console.error('Voice ID is missing. Cannot synthesize speech.');
      return this.generateMockAudio(text);
    }

    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error (${response.status}):`, response.statusText, errorText);
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('Successfully synthesized speech with ElevenLabs');
      return blob;
    } catch (error) {
      console.error('Error synthesizing speech with ElevenLabs:', error);
      console.warn('Falling back to mock audio');
      return this.generateMockAudio(text);
    }
  }

  private generateMockAudio(text: string): Blob {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = Math.max(2, text.length / 15);
    const sampleRate = audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      channelData[i] = Math.sin(2 * Math.PI * 440 * t) * 0.1 * Math.exp(-t);
    }

    const wavData = this.audioBufferToWav(audioBuffer);
    return new Blob([wavData], { type: 'audio/wav' });
  }

  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length * numChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    const writeString = (s: string) => {
      for (let i = 0; i < s.length; i++) {
        view.setUint8(pos + i, s.charCodeAt(i));
      }
      pos += s.length;
    };

    const writeUint32 = (d: number) => {
      view.setUint32(pos, d, true);
      pos += 4;
    };

    const writeUint16 = (d: number) => {
      view.setUint16(pos, d, true);
      pos += 2;
    };

    writeString('RIFF');
    writeUint32(36 + length);
    writeString('WAVE');
    writeString('fmt ');
    writeUint32(16);
    writeUint16(1);
    writeUint16(numChannels);
    writeUint32(buffer.sampleRate);
    writeUint32(buffer.sampleRate * 2 * numChannels);
    writeUint16(numChannels * 2);
    writeUint16(16);
    writeString('data');
    writeUint32(length);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (offset < buffer.length) {
      for (let i = 0; i < numChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][offset]));
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        pos += 2;
      }
      offset++;
    }

    return arrayBuffer;
  }

  async getVoices() {
    if (!this.apiKey || this.apiKey === 'your_elevenlabs_api_key_here' || this.apiKey.trim() === '') {
      console.warn('ElevenLabs API key not configured. Cannot fetch voices.');
      return [];
    }

    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch voices (${response.status}):`, response.statusText, errorText);
        throw new Error(`Failed to fetch voices: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }
}

export const elevenLabsService = new ElevenLabsService();
