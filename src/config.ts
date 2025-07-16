export const config = {
  // Audio settings
  audio: {
    sampleRate: 16000,
    channels: 1,
    chunkDuration: 10, // seconds - shorter chunks for better real-time
    silenceThreshold: 0.5, // seconds of silence to split chunks
  },
  
  // Transcription settings
  transcription: {
    model: 'whisper-1',
    language: 'en',
    enableDiarization: true,
    enableTimestamps: true,
  },
  
  // System audio device names (BlackHole)
  devices: {
    blackhole: 'BlackHole 2ch',
    blackhole16: 'BlackHole 16ch',
    multiOutput: 'Multi-Output Device'
  }
};