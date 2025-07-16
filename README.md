# Meeting Transcriber

A professional meeting transcription tool for macOS that captures system audio and microphone input, providing real-time transcription with speaker identification.

## Features

- **Dual Audio Capture**: Captures both system audio (Zoom, Teams, WhatsApp, Signal, etc.) and microphone
- **Speaker Diarization**: Automatically identifies different speakers
- **Real-time Transcription**: Live transcription with 10-second processing intervals
- **Meeting Analytics**: Talk time analysis, keyword extraction, and meeting summaries
- **Multiple Export Formats**: JSON, TXT, and SRT subtitle formats
- **Search Functionality**: Search across all transcript history
- **Cost Optimized**: Approximately $0.06 per hour of meeting transcription

## Prerequisites

- macOS (required for audio capture)
- Node.js 18+
- OpenAI API key
- BlackHole virtual audio driver
- FFmpeg and Sox

## Installation

1. **Install dependencies:**
   ```bash
   # Install audio tools
   brew install blackhole-2ch ffmpeg sox
   
   # Install Node dependencies
   npm install
   ```

2. **Configure BlackHole** (one-time setup):
   - Open Audio MIDI Setup (in /Applications/Utilities/)
   - Click "+" → "Create Multi-Output Device"
   - Check both "BlackHole 2ch" and your normal output (speakers/headphones)
   - Name it "Multi-Output Device"

3. **Set up environment:**
   ```bash
   # Copy the .env template and add your OpenAI API key
   cp .env.example .env
   # Edit .env and add: OPENAI_API_KEY=your_key_here
   ```

4. **Verify setup:**
   ```bash
   npm run setup-audio
   ```

## Usage

1. **Before each meeting:**
   - Option-click the volume icon in menu bar
   - Select "Multi-Output Device" as output
   - This allows you to hear audio while the app captures it

2. **Start transcribing:**
   ```bash
   npm start
   ```

3. **Use the menu to:**
   - Start new meeting transcription
   - View previous meetings
   - Search transcripts
   - Export meetings in various formats
   - Get audio setup instructions

## How It Works

1. **Audio Capture**: Uses BlackHole to capture system audio and Sox for microphone
2. **Processing**: Audio is processed in 10-second chunks for near real-time transcription
3. **Transcription**: OpenAI Whisper API provides accurate transcription with timestamps
4. **Speaker ID**: System audio is labeled as "Speaker 1", "Speaker 2", etc. Microphone is "You"
5. **Storage**: SQLite database stores all transcripts with full-text search capability

## Audio Setup Details

The app uses a multi-output device to capture system audio:
- Your audio plays through normal speakers/headphones
- BlackHole receives a copy of the same audio
- The app captures from BlackHole for transcription

## Cost

- Uses OpenAI Whisper API at $0.006 per minute
- Typical meeting costs ~$0.06 per hour
- Only transcribes when audio is detected

## Troubleshooting

1. **No system audio captured**: Ensure Multi-Output Device is selected as system output
2. **No microphone audio**: Check microphone permissions in System Preferences
3. **FFmpeg errors**: Ensure BlackHole is properly installed and configured
4. **API errors**: Verify your OpenAI API key is correct and has credits

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Check audio setup
npm run setup-audio
```

## Security

- API key is stored locally in .env file
- No audio data is stored permanently (only transcripts)
- All processing happens locally except for OpenAI API calls

## License

MIT License - See LICENSE file for details