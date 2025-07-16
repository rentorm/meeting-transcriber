import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { config } from './config';
import * as path from 'path';

export class SystemAudioCapture extends EventEmitter {
  private ffmpegProcess: ChildProcess | null = null;
  private micProcess: ChildProcess | null = null;
  private isRecording = false;

  async startCapture(): Promise<void> {
    this.isRecording = true;

    // Capture system audio using BlackHole
    this.startSystemAudioCapture();
    
    // Capture microphone audio
    this.startMicrophoneCapture();
  }

  private startSystemAudioCapture(): void {
    // Use FFmpeg to capture from BlackHole audio device
    this.ffmpegProcess = spawn('ffmpeg', [
      '-f', 'avfoundation',
      '-i', `:${config.devices.blackhole}`,
      '-acodec', 'pcm_s16le',
      '-ar', config.audio.sampleRate.toString(),
      '-ac', '1',
      '-f', 'wav',
      '-'  // output to stdout
    ]);

    this.ffmpegProcess.stdout?.on('data', (data) => {
      // Process audio chunks
      this.emit('systemAudio', data);
    });

    this.ffmpegProcess.stderr?.on('data', (data) => {
      console.log('FFmpeg:', data.toString());
    });

    this.ffmpegProcess.on('error', (error) => {
      console.error('FFmpeg error:', error);
    });
  }

  private startMicrophoneCapture(): void {
    // Use sox to record from default microphone
    this.micProcess = spawn('sox', [
      '-d',                    // default audio device
      '-r', config.audio.sampleRate.toString(),
      '-c', '1',              // mono
      '-b', '16',             // 16-bit
      '-e', 'signed-integer',
      '-t', 'wav',
      '-',                    // output to stdout
      'silence', '1', '0.1', '1%', '1', '1.0', '1%'  // remove silence
    ]);

    this.micProcess.stdout?.on('data', (data) => {
      this.emit('microphoneAudio', data);
    });

    this.micProcess.stderr?.on('data', (data) => {
      console.log('Sox:', data.toString());
    });
  }

  async stopCapture(): Promise<void> {
    this.isRecording = false;
    
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill('SIGTERM');
      this.ffmpegProcess = null;
    }
    
    if (this.micProcess) {
      this.micProcess.kill('SIGTERM');
      this.micProcess = null;
    }
  }

  isCapturing(): boolean {
    return this.isRecording;
  }
}