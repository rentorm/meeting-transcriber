# Release Notes - v0.1.0-alpha

## 🎉 Initial Alpha Release

We're excited to announce the first public alpha release of Meeting Transcriber!

### What is Meeting Transcriber?

Meeting Transcriber is a macOS application that captures and transcribes your online meetings in real-time. It records both system audio (from Zoom, Teams, etc.) and your microphone, providing accurate transcriptions with speaker identification.

### ⚠️ Alpha Status

This is an **ALPHA** release, which means:
- The software is functional but not thoroughly tested
- APIs and features may change significantly
- Bugs and issues are expected
- Not recommended for production use

### Key Features

- 🎤 **Dual Audio Capture**: Records system audio and microphone simultaneously
- 👥 **Speaker Diarization**: Identifies different speakers in the conversation
- ⚡ **Real-time Transcription**: Processes audio in 10-second chunks
- 📊 **Meeting Analytics**: Talk time analysis and keyword extraction
- 💾 **Multiple Export Formats**: JSON, TXT, and SRT
- 🔍 **Search Functionality**: Full-text search across all transcripts

### Requirements

- macOS (Intel or Apple Silicon)
- Node.js 18+
- BlackHole 2ch virtual audio driver
- OpenAI API key
- FFmpeg and Sox

### Known Limitations

- macOS only (no Windows/Linux support)
- Requires manual audio setup in Audio MIDI Setup
- Speaker diarization accuracy varies
- No pause/resume during recording
- Limited error recovery for network issues

### Getting Started

1. Install dependencies: `brew install blackhole-2ch ffmpeg sox`
2. Clone the repository
3. Run `npm install`
4. Copy `.env.example` to `.env` and add your OpenAI API key
5. Run `npm run setup-audio` to verify configuration
6. Start with `npm run dev`

### What's Next?

Check our [roadmap](IMPROVEMENT_RECOMMENDATIONS.md) for planned features, including:
- Migration to AssemblyAI for better accuracy
- GUI interface
- Real-time streaming transcription
- Enhanced speaker identification

### Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting PRs.

### Feedback

Found a bug? Have a feature request? Please open an issue on GitHub!

Thank you for trying Meeting Transcriber! 🚀