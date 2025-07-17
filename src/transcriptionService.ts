import { AssemblyAI } from 'assemblyai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { TranscriptionSegment } from './types';

export class TranscriptionService {
  private client: AssemblyAI;

  constructor(apiKey: string) {
    this.client = new AssemblyAI({ apiKey });
  }

  async transcribeWithSpeakerDiarization(
    audioBuffer: Buffer, 
    source: 'microphone' | 'system'
  ): Promise<TranscriptionSegment[]> {
    return this.transcribeWithRetry(audioBuffer, source);
  }

  private async transcribeWithRetry(
    audioBuffer: Buffer,
    source: 'microphone' | 'system',
    attempt: number = 1
  ): Promise<TranscriptionSegment[]> {
    const maxAttempts = 3;
    
    try {
      return await this.performTranscription(audioBuffer, source);
    } catch (error) {
      console.error(`Transcription error (attempt ${attempt}/${maxAttempts}):`, error);
      
      if (this.isRetryableError(error) && attempt < maxAttempts) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Retrying after ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        return this.transcribeWithRetry(audioBuffer, source, attempt + 1);
      }
      
      return [];
    }
  }

  private async performTranscription(
    audioBuffer: Buffer,
    source: 'microphone' | 'system'
  ): Promise<TranscriptionSegment[]> {
      // Save buffer to temporary file
      const tempPath = path.join(os.tmpdir(), `temp_${Date.now()}.wav`);
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
      let transcript = await this.client.transcripts.transcribe(config);

      // Clean up temp file
      fs.unlinkSync(tempPath);

      // Poll until transcript is completed or errors out
      while (transcript.status === 'queued' || transcript.status === 'processing') {
        await new Promise(res => setTimeout(res, 5000));
        transcript = await this.client.transcripts.get(transcript.id);
      }

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


  async transcribeRealtimeStream(audioStream: Buffer): Promise<string> {
    // For real-time transcription, AssemblyAI offers WebSocket streaming
    // This is a simplified batch version for now
    try {
      const tempPath = path.join(os.tmpdir(), `stream_${Date.now()}.wav`);
      fs.writeFileSync(tempPath, audioStream);

      // Upload the audio file
      const uploadUrl = await this.client.files.upload(tempPath);

      // Quick transcription without speaker diarization for real-time
      const config = {
        audio: uploadUrl,
        speaker_labels: false,
        language_code: 'en',
      };

      let transcript = await this.client.transcripts.transcribe(config);

      fs.unlinkSync(tempPath);

      // Poll until transcript is completed or errors out
      while (transcript.status === 'queued' || transcript.status === 'processing') {
        await new Promise(res => setTimeout(res, 5000));
        transcript = await this.client.transcripts.get(transcript.id);
      }

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