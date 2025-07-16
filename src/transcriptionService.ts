import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { TranscriptionSegment } from './types';

export class TranscriptionService {
  private openai: OpenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.openai = new OpenAI({ apiKey });
  }

  async transcribeWithSpeakerDiarization(
    audioBuffer: Buffer, 
    source: 'microphone' | 'system'
  ): Promise<TranscriptionSegment[]> {
    try {
      // Save buffer to temporary file
      const tempPath = path.join(__dirname, `temp_${Date.now()}.wav`);
      fs.writeFileSync(tempPath, audioBuffer);

      // Get transcription with timestamps
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: 'whisper-1',
        language: 'en',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment']
      });

      // Clean up temp file
      fs.unlinkSync(tempPath);

      // Process segments with speaker labels
      const segments: TranscriptionSegment[] = [];
      
      if (transcription.segments) {
        for (const segment of transcription.segments) {
          segments.push({
            text: segment.text.trim(),
            speaker: source === 'microphone' ? 'You' : this.identifySpeaker(segment),
            timestamp: new Date(Date.now() + (segment.start * 1000)),
            confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : 0.5
          });
        }
      } else {
        // Fallback if no segments
        segments.push({
          text: transcription.text,
          speaker: source === 'microphone' ? 'You' : 'Speaker',
          timestamp: new Date(),
          confidence: 0.8
        });
      }

      return segments;
    } catch (error) {
      console.error('Transcription error:', error);
      return [];
    }
  }

  private identifySpeaker(segment: { avg_logprob: number }): string {
    // Simple speaker identification based on audio characteristics
    // In a production system, you'd use a proper speaker diarization service
    
    // For now, we'll use a simple heuristic based on average log probability
    // and segment characteristics to assign generic speaker labels
    
    if (segment.avg_logprob > -0.5) {
      return 'Speaker 1';
    } else if (segment.avg_logprob > -1.0) {
      return 'Speaker 2';
    } else {
      return 'Speaker 3';
    }
  }

  async transcribeRealtimeStream(audioStream: Buffer): Promise<string> {
    // For real-time transcription, we could use WebSocket streaming
    // This is a simplified version
    try {
      const tempPath = path.join(__dirname, `stream_${Date.now()}.wav`);
      fs.writeFileSync(tempPath, audioStream);

      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: 'whisper-1',
        language: 'en'
      });

      fs.unlinkSync(tempPath);
      return transcription.text;
    } catch (error) {
      console.error('Stream transcription error:', error);
      return '';
    }
  }
}