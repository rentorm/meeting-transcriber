import { AssemblyAI, Transcript } from 'assemblyai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { TranscriptionSegment } from './types';

export class TranscriptionService {
  private client: AssemblyAI;
  private readonly MAX_WAIT_TIME = 5 * 60 * 1000; // 5 minutes
  private readonly POLL_INTERVAL = 5000; // 5 seconds

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
      // Upload audio and start transcription
      const transcript = await this.uploadAndTranscribe(audioBuffer, true);
      
      if (!transcript) {
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

  private async uploadAndTranscribe(
    audioBuffer: Buffer,
    enableSpeakerLabels: boolean
  ): Promise<Transcript | null> {
    // Save buffer to temporary file
    const tempPath = path.join(os.tmpdir(), `audio_${Date.now()}.wav`);
    
    try {
      fs.writeFileSync(tempPath, audioBuffer);

      // Upload the audio file
      const uploadUrl = await this.client.files.upload(tempPath);

      // Configure transcription
      const config = {
        audio: uploadUrl,
        speaker_labels: enableSpeakerLabels,
        language_code: 'en',
      };

      // Start transcription
      const transcript = await this.client.transcripts.transcribe(config);

      // Poll until completed
      const completedTranscript = await this.pollTranscriptStatus(transcript.id);

      return completedTranscript;
    } finally {
      // Always clean up temp file
      try {
        fs.unlinkSync(tempPath);
      } catch (error) {
        console.error('Failed to clean up temp file:', error);
      }
    }
  }

  private async pollTranscriptStatus(transcriptId: string): Promise<Transcript | null> {
    const startTime = Date.now();
    let transcript = await this.client.transcripts.get(transcriptId);
    
    while (transcript.status === 'queued' || transcript.status === 'processing') {
      if (Date.now() - startTime > this.MAX_WAIT_TIME) {
        console.error('Transcription timeout: exceeded maximum wait time');
        return null;
      }
      
      await new Promise(res => setTimeout(res, this.POLL_INTERVAL));
      transcript = await this.client.transcripts.get(transcriptId);
    }

    if (transcript.status === 'error') {
      console.error('Transcription error:', transcript.error);
      return null;
    }

    return transcript;
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
      const transcript = await this.uploadAndTranscribe(audioStream, false);
      return transcript?.text || '';
    } catch (error) {
      console.error('Stream transcription error:', error);
      return '';
    }
  }
}