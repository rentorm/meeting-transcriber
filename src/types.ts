export interface Session {
  id?: number;
  name: string;
  startTime: Date;
  endTime?: Date;
  participants?: string;
}

export interface Transcript {
  id?: number;
  sessionId: number;
  timestamp: Date;
  speaker: string;
  text: string;
  confidence?: number;
}

export interface AudioChunk {
  buffer: Buffer;
  timestamp: Date;
  source: 'microphone' | 'system';
}

export interface TranscriptionSegment {
  text: string;
  speaker: string;
  timestamp: Date;
  confidence: number;
}