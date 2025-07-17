# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial alpha release of Meeting Transcriber
- System audio capture via BlackHole virtual audio driver
- Microphone audio capture with Sox
- Real-time transcription using OpenAI Whisper API
- Speaker diarization (system audio speakers + "You" for microphone)
- SQLite database storage with full-text search
- Terminal-based user interface
- Meeting analysis with talk time and keyword extraction
- Export functionality (JSON, TXT, SRT formats)
- Audio setup verification script
- TypeScript support with strict mode
- ESLint configuration
- Comprehensive documentation for open-source release

### Known Issues
- Speaker diarization accuracy needs improvement
- No pause/resume functionality during recording
- Limited error recovery for network issues
- macOS-only support
- Requires manual audio setup in Audio MIDI Setup
- No authentication or multi-user support

### Planned
- Migration to AssemblyAI for improved accuracy
- Real-time streaming transcription
- GUI interface
- Better speaker identification
- Live transcript editing
- See [IMPROVEMENT_RECOMMENDATIONS.md](IMPROVEMENT_RECOMMENDATIONS.md) for full roadmap

## [0.1.0-alpha] - 2024-01-XX

### Added
- First public alpha release
- Core meeting transcription functionality
- Basic documentation and setup guides
- MIT License

[Unreleased]: https://github.com/rentorm/meeting-transcriber/compare/v0.1.0-alpha...HEAD
[0.1.0-alpha]: https://github.com/rentorm/meeting-transcriber/releases/tag/v0.1.0-alpha