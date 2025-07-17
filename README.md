# Meeting Transcriber

> ⚠️ **ALPHA SOFTWARE**: This project is in an experimental state and not ready for production use. APIs may change, features may be incomplete, and bugs are expected. Use at your own risk.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![macOS](https://img.shields.io/badge/Platform-macOS-blue.svg)](https://www.apple.com/macos/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Alpha Status](https://img.shields.io/badge/Status-Alpha-red.svg)]()

A professional meeting transcription tool for macOS that captures system audio and microphone input, providing real-time transcription with speaker identification.

## 🚧 Project Status

This project is currently in **ALPHA** stage:
- Core functionality is implemented but not thoroughly tested
- The API and features are subject to change
- Not recommended for production or critical use cases
- Contributions and feedback are welcome!

See our [Roadmap](IMPROVEMENT_RECOMMENDATIONS.md) for planned improvements and AssemblyAI migration plans.

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
- AssemblyAI API key
- BlackHole virtual audio driver
- FFmpeg and Sox

> **Note**: This project now uses AssemblyAI for superior transcription accuracy and built-in speaker diarization.

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
   # Create your environment configuration
   cp .env.example .env
   # Edit .env and add your AssemblyAI API key:
   # ASSEMBLYAI_API_KEY=your_key_here
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
3. **Transcription**: AssemblyAI provides industry-leading accuracy with automatic speaker diarization
4. **Speaker ID**: System audio is labeled as "Speaker 1", "Speaker 2", etc. Microphone is "You"
5. **Storage**: SQLite database stores all transcripts with full-text search capability

## Audio Setup Details

The app uses a multi-output device to capture system audio:
- Your audio plays through normal speakers/headphones
- BlackHole receives a copy of the same audio
- The app captures from BlackHole for transcription

## Cost

- Uses AssemblyAI API at $0.00025 per second (~$0.015 per minute)
- Typical meeting costs ~$0.90 per hour
- Only transcribes when audio is detected
- Speaker diarization included at no extra cost

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
- All processing happens locally except for AssemblyAI API calls

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/rentorm/meeting-transcriber.git
cd meeting-transcriber

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests (when available)
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Community

- **Issues**: [GitHub Issues](https://github.com/rentorm/meeting-transcriber/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rentorm/meeting-transcriber/discussions)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Security

- API keys are stored locally in .env file (never committed)
- No audio data is stored permanently (only transcripts)
- All processing happens locally except for transcription API calls
- For security concerns, please see [SECURITY.md](SECURITY.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [BlackHole Audio](https://github.com/ExistentialAudio/BlackHole) for virtual audio routing
- [AssemblyAI](https://www.assemblyai.com/) for transcription and speaker diarization

---

<p align="center">
  Made with ❤️ for better meeting productivity
</p>