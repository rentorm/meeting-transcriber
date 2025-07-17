import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import { Database } from './database';
import { SystemAudioCapture } from './audioCapture';
import { TranscriptionService } from './transcriptionService';
import { MeetingAnalyzer } from './meetingAnalyzer';
import { UI } from './ui';
import { AudioChunk } from './types';
import { AudioUtils } from './audioUtils';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

class MeetingTranscriberApp {
  private db: Database;
  private audioCapture: SystemAudioCapture;
  private transcriptionService: TranscriptionService;
  private analyzer: MeetingAnalyzer;
  private ui: UI;
  private currentSessionId: number | null = null;
  private audioQueue: AudioChunk[] = [];
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.db = new Database();
    this.audioCapture = new SystemAudioCapture();
    this.transcriptionService = new TranscriptionService(
      process.env.ASSEMBLYAI_API_KEY || ''
    );
    this.analyzer = new MeetingAnalyzer();
    this.ui = new UI();

    this.setupAudioHandlers();
  }

  private setupAudioHandlers(): void {
    this.audioCapture.on('systemAudio', (buffer: Buffer) => {
      this.audioQueue.push({
        buffer,
        timestamp: new Date(),
        source: 'system'
      });
    });

    this.audioCapture.on('microphoneAudio', (buffer: Buffer) => {
      this.audioQueue.push({
        buffer,
        timestamp: new Date(),
        source: 'microphone'
      });
    });
  }

  async run(): Promise<void> {
    console.clear();
    console.log(chalk.bold('🎙️  Professional Meeting Transcriber\n'));

    // Check for API key
    if (!process.env.ASSEMBLYAI_API_KEY) {
      console.log(chalk.red('⚠️  AssemblyAI API key not found!'));
      console.log('Please create a .env file with: ASSEMBLYAI_API_KEY=your_key_here\n');
      process.exit(1);
    }

    while (true) {
      const choice = await this.ui.showMainMenu();

      switch (choice) {
        case 'new':
          await this.startNewMeeting();
          break;
        case 'view':
          await this.viewMeetings();
          break;
        case 'search':
          await this.searchTranscripts();
          break;
        case 'export':
          await this.exportMeeting();
          break;
        case 'setup':
          await this.ui.showAudioSetup();
          break;
        case 'exit':
          this.cleanup();
          process.exit(0);
      }
    }
  }

  private async startNewMeeting(): Promise<void> {
    const { name, participants } = await this.ui.getMeetingDetails();
    this.currentSessionId = await this.db.createSession(name, participants);

    this.ui.displayMeetingHeader(name, participants);
    
    const spinner = this.ui.showRecordingStatus();

    // Start audio capture
    await this.audioCapture.startCapture();

    // Process audio queue periodically
    this.processingInterval = setInterval(async () => {
      await this.processAudioQueue(spinner);
    }, 10000); // Process every 10 seconds

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await this.stopRecording(spinner);
    });
  }

  private async processAudioQueue(spinner: ora.Ora): Promise<void> {
    if (this.audioQueue.length === 0) return;

    // Group audio chunks by source
    const systemChunks = this.audioQueue.filter(c => c.source === 'system');
    const micChunks = this.audioQueue.filter(c => c.source === 'microphone');
    
    this.audioQueue = []; // Clear queue

    spinner.stop();

    // Process system audio
    if (systemChunks.length > 0) {
      const combinedBuffer = AudioUtils.combineWavBuffers(systemChunks.map(c => c.buffer));
      if (combinedBuffer.length > 0 && AudioUtils.isValidWavBuffer(combinedBuffer)) {
        const segments = await this.transcriptionService.transcribeWithSpeakerDiarization(
          combinedBuffer, 
          'system'
        );
        
        for (const segment of segments) {
          if (this.currentSessionId && segment.text.trim()) {
            await this.db.addTranscript(
              this.currentSessionId,
              segment.speaker,
              segment.text,
              segment.confidence
            );
            this.ui.displayLiveTranscript(segment.speaker, segment.text, segment.confidence);
          }
        }
      }
    }

    // Process microphone audio
    if (micChunks.length > 0) {
      const combinedBuffer = AudioUtils.combineWavBuffers(micChunks.map(c => c.buffer));
      if (combinedBuffer.length > 0 && AudioUtils.isValidWavBuffer(combinedBuffer)) {
        const segments = await this.transcriptionService.transcribeWithSpeakerDiarization(
          combinedBuffer,
          'microphone'
        );
        
        for (const segment of segments) {
          if (this.currentSessionId && segment.text.trim()) {
            await this.db.addTranscript(
              this.currentSessionId,
              segment.speaker,
              segment.text,
              segment.confidence
            );
            this.ui.displayLiveTranscript(segment.speaker, segment.text, segment.confidence);
          }
        }
      }
    }

    spinner.start();
  }

  private async stopRecording(spinner: ora.Ora): Promise<void> {
    spinner.stop();
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    // Process remaining audio
    const processingSpinner = this.ui.showProcessingStatus('Processing final audio...');
    await this.processAudioQueue(processingSpinner);
    processingSpinner.stop();

    // Stop audio capture
    await this.audioCapture.stopCapture();

    if (this.currentSessionId) {
      await this.db.endSession(this.currentSessionId);
      
      // Show analysis
      const transcripts = await this.db.getTranscripts(this.currentSessionId);
      const analysis = this.analyzer.analyzeMeeting(transcripts);
      this.ui.displayAnalysis(analysis);

      console.log('\n✅ Meeting ended and saved.');
    }

    await this.ui.waitForKeyPress();
    this.currentSessionId = null;
    
    // Reset SIGINT handler
    process.removeAllListeners('SIGINT');
    process.on('SIGINT', () => {
      this.cleanup();
      process.exit(0);
    });
  }

  private async viewMeetings(): Promise<void> {
    const sessions = await this.db.getSessions();
    const sessionId = await this.ui.selectSession(sessions);

    if (sessionId) {
      const transcripts = await this.db.getTranscripts(sessionId);
      this.ui.displayTranscripts(transcripts);
      
      // Show analysis
      const analysis = this.analyzer.analyzeMeeting(transcripts);
      this.ui.displayAnalysis(analysis);
      
      await this.ui.waitForKeyPress();
    }
  }

  private async searchTranscripts(): Promise<void> {
    const query = await this.ui.getSearchQuery();
    if (!query) return;

    const results = await this.db.searchTranscripts(query);
    
    if (results.length === 0) {
      console.log(chalk.yellow('No results found.'));
    } else {
      console.log(chalk.green(`Found ${results.length} results:\n`));
      this.ui.displayTranscripts(results);
    }
    
    await this.ui.waitForKeyPress();
  }

  private async exportMeeting(): Promise<void> {
    const sessions = await this.db.getSessions();
    const sessionId = await this.ui.selectSession(sessions);
    
    if (!sessionId) return;

    const format = await this.ui.getExportFormat();
    const content = await this.db.exportSession(sessionId, format);
    
    const filename = `meeting_${sessionId}_${Date.now()}.${format}`;
    const filepath = path.join(process.cwd(), filename);
    
    fs.writeFileSync(filepath, content);
    console.log(chalk.green(`✅ Exported to: ${filepath}`));
    
    await this.ui.waitForKeyPress();
  }

  private cleanup(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    this.audioCapture.removeAllListeners();
    this.db.close();
  }
}

// Main execution
const app = new MeetingTranscriberApp();
app.run().catch(console.error);