# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a professional meeting transcription tool for macOS that captures system audio and microphone input, providing real-time transcription with speaker identification. The system uses BlackHole virtual audio driver to capture system audio (from apps like Zoom, Teams, etc.) and Sox for microphone capture.

## Common Development Commands

```bash
# Development
npm run dev          # Run in development mode with ts-node
npm run build        # Compile TypeScript to JavaScript
npm start           # Build and run the compiled app

# Code Quality
npm run typecheck   # Type checking with TypeScript
npm run lint        # ESLint linting
npm run lint:fix    # Fix ESLint issues automatically

# Audio Setup
npm run setup-audio # Check and verify audio configuration
```

## Architecture & Key Components

### Core Application Structure
- **Main App** (`src/index.ts`): Entry point with `MeetingTranscriberApp` class that orchestrates all components
- **Database** (`src/database.ts`): SQLite-based storage with sessions and transcripts tables
- **Audio Capture** (`src/audioCapture.ts`): Handles dual audio capture using FFmpeg (BlackHole) and Sox (microphone)
- **Transcription Service** (`src/transcriptionService.ts`): OpenAI Whisper API integration with speaker diarization
- **UI** (`src/ui.ts`): Terminal-based interface using Inquirer and Chalk
- **Meeting Analyzer** (`src/meetingAnalyzer.ts`): Post-meeting analysis including talk time and keyword extraction

### Audio Processing Flow
1. **Dual Capture**: System audio via BlackHole (FFmpeg) + microphone via Sox
2. **Chunking**: Audio processed in 10-second intervals for real-time transcription
3. **Speaker ID**: System audio labeled as "Speaker 1", "Speaker 2", etc.; microphone as "You"
4. **Storage**: Transcripts stored in SQLite with full-text search capability

### Key Technical Details
- **Audio Format**: PCM 16-bit, 16kHz sample rate, mono
- **Processing**: Real-time chunking with 10-second intervals
- **Storage**: SQLite with FTS for transcript search
- **API**: OpenAI Whisper for transcription (~$0.06/hour)

## macOS-Specific Requirements

This tool requires macOS-specific setup:
- BlackHole 2ch virtual audio driver
- Multi-Output Device configuration in Audio MIDI Setup
- System audio output must be set to Multi-Output Device during meetings

## Environment Setup

Required environment variables:
- `OPENAI_API_KEY`: OpenAI API key for Whisper transcription

## Development Notes

- The app uses TypeScript with strict mode enabled
- Database schema includes sessions and transcripts tables with FTS indexing
- Audio capture uses child processes for FFmpeg and Sox
- Error handling includes graceful cleanup of audio processes and temp files
- The UI is entirely terminal-based with spinner indicators for long operations

## Testing

No specific test framework is configured. To test functionality:
1. Run `npm run setup-audio` to verify audio configuration
2. Test with a short meeting to verify transcription accuracy
3. Check database storage and export functionality