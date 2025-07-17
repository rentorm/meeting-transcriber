import { AssemblyAI } from 'assemblyai';
import fs from 'fs';
import path from 'path';
import { TranscriptionSegment } from './types';

export class TranscriptionService {
  private client: AssemblyAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new AssemblyAI({ apiKey });
  }

  async transcribeWithSpeakerDiarization(
    audioBuffer: Buffer, 
    source: 'microphone' | 'system'
  ): Promise<TranscriptionSegment[]> {
    try {
      // Save buffer to temporary file
      const tempPath = path.join(__dirname, `temp_${Date.now()}.wav`);
      fs.writeFileSync(tempPath, audioBuffer);

      // Upload the audio file
      const uploadUrl = await this.client.files.upload(tempPath);

      // Configure transcription with speaker diarization
      const config = {
        audio: uploadUrl,
        speaker_labels: true,
        language_code: 'en',
      };

      // Start transcription
      const transcript = await this.client.transcripts.transcribe(config);

      // Clean up temp file
      fs.unlinkSync(tempPath);

      // Check if transcription was successful
      if (transcript.status === 'error') {
        console.error('Transcription error:', transcript.error);
        return [];
      }

      // Process utterances with speaker labels
      const segments: TranscriptionSegment[] = [];
      
      if (transcript.utterances) {
        for (const utterance of transcript.utterances) {
          segments.push({
            text: utterance.text.trim(),
            speaker: source === 'microphone' ? 'You' : `Speaker ${utterance.speaker}`,
            timestamp: new Date(utterance.start),
            confidence: utterance.confidence
          });
        }
      } else if (transcript.text) {
        // Fallback if no utterances (shouldn't happen with speaker_labels enabled)
        segments.push({
          text: transcript.text,
          speaker: source === 'microphone' ? 'You' : 'Speaker',
          timestamp: new Date(),
          confidence: transcript.confidence || 0.8
        });
      }

      return segments;
    } catch (error) {
      console.error('Transcription error:', error);
      
      // Implement retry logic for transient errors
      if (this.isRetryableError(error)) {
        return this.retryTranscription(audioBuffer, source);
      }
      
      return [];
    }
  }

  private isRetryableError(error: unknown): boolean {
    // Check for retryable errors (rate limits, network issues, etc.)
    if (error && typeof error === 'object') {
      const err = error as { response?: { status?: number }, code?: string };
      if (err.response?.status === 429 || // Rate limit
          err.response?.status && err.response.status >= 500 || // Server errors
          err.code === 'ECONNRESET' ||
          err.code === 'ETIMEDOUT') {
        return true;
      }
    }
    return false;
  }

  private async retryTranscription(
    audioBuffer: Buffer,
    source: 'microphone' | 'system',
    attempt: number = 1
  ): Promise<TranscriptionSegment[]> {
    const maxAttempts = 3;
    const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff

    if (attempt > maxAttempts) {
      console.error('Max retry attempts reached');
      return [];
    }

    console.log(`Retrying transcription (attempt ${attempt}/${maxAttempts}) after ${backoffMs}ms...`);
    await new Promise(resolve => setTimeout(resolve, backoffMs));

    try {
      return await this.transcribeWithSpeakerDiarization(audioBuffer, source);
    } catch (error) {
      if (this.isRetryableError(error) && attempt < maxAttempts) {
        return this.retryTranscription(audioBuffer, source, attempt + 1);
      }
      console.error('Retry failed:', error);
      return [];
    }
  }

  async transcribeRealtimeStream(audioStream: Buffer): Promise<string> {
    // For real-time transcription, AssemblyAI offers WebSocket streaming
    // This is a simplified batch version for now
    try {
      const tempPath = path.join(__dirname, `stream_${Date.now()}.wav`);
      fs.writeFileSync(tempPath, audioStream);

      // Upload the audio file
      const uploadUrl = await this.client.files.upload(tempPath);

      // Quick transcription without speaker diarization for real-time
      const config = {
        audio: uploadUrl,
        speaker_labels: false,
        language_code: 'en',
      };

      const transcript = await this.client.transcripts.transcribe(config);

      fs.unlinkSync(tempPath);

      if (transcript.status === 'error') {
        console.error('Stream transcription error:', transcript.error);
        return '';
      }

      return transcript.text || '';
    } catch (error) {
      console.error('Stream transcription error:', error);
      return '';
    }
  }
}