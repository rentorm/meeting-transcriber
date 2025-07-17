# Contributing to Meeting Transcriber

Thank you for your interest in contributing to Meeting Transcriber! This document provides guidelines and information for contributors.

## 🚨 Alpha Status Notice

This project is in **ALPHA** state. While we welcome contributions, please be aware that:
- APIs and architecture may change significantly
- Features may be incomplete or experimental
- Breaking changes may occur without notice
- Your contributions may need to be refactored as the project evolves

## Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Roadmap](#roadmap)

## Getting Started

1. **Check existing issues** - Look at existing issues to see if your idea or bug has already been reported
2. **Read the roadmap** - Check our [improvement recommendations](IMPROVEMENT_RECOMMENDATIONS.md) to understand planned changes
3. **Join discussions** - Participate in GitHub Discussions for questions and ideas

## How to Contribute

### 🐛 Bug Reports

1. Use the bug report template when creating an issue
2. Include:
   - macOS version
   - Node.js version
   - Clear steps to reproduce
   - Expected vs actual behavior
   - Console logs/error messages
   - Audio setup configuration

### ✨ Feature Requests

1. Use the feature request template
2. Check if the feature is already planned in our [roadmap](IMPROVEMENT_RECOMMENDATIONS.md)
3. Explain the use case and expected benefit
4. Consider if the feature fits the alpha scope

### 🔧 Code Contributions

We especially welcome contributions in these areas:
- **Bug fixes** for existing functionality
- **AssemblyAI migration** (see roadmap)
- **Error handling** improvements
- **Documentation** improvements
- **Testing** infrastructure
- **UI/UX** enhancements

## Development Setup

### Prerequisites

- macOS (required for audio capture)
- Node.js 18+
- Git
- BlackHole audio driver
- FFmpeg and Sox

### Setup Steps

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/rentorm/meeting-transcriber.git
cd meeting-transcriber

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API key

# Verify setup
npm run setup-audio

# Run in development mode
npm run dev
```

### Project Structure

```
src/
├── index.ts              # Main application entry point
├── audioCapture.ts       # Audio capture from BlackHole and microphone
├── transcriptionService.ts # OpenAI Whisper integration (migrating to AssemblyAI)
├── database.ts          # SQLite database operations
├── ui.ts                # Terminal-based user interface
├── meetingAnalyzer.ts   # Meeting analysis and insights
├── audioUtils.ts        # Audio processing utilities
├── config.ts            # Application configuration
└── types.ts             # TypeScript type definitions
```

## Code Style

### TypeScript

- Use strict TypeScript mode
- Prefer explicit types over `any`
- Use proper async/await for promises
- Follow existing naming conventions

### Formatting

```bash
# Check linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Type checking
npm run typecheck
```

### Code Guidelines

1. **Error Handling**: Always handle errors gracefully
2. **Logging**: Use appropriate log levels (debug, info, warn, error)
3. **Comments**: Comment complex logic, not obvious code
4. **Functions**: Keep functions focused and reasonably sized
5. **Security**: Never commit API keys or sensitive data

### Example Code Style

```typescript
// Good
async function transcribeAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
  try {
    const result = await transcriptionService.transcribe(audioBuffer);
    logger.info(`Transcription completed: ${result.text.length} characters`);
    return result;
  } catch (error) {
    logger.error('Transcription failed:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

// Bad
function transcribeAudio(audioBuffer: any) {
  const result = transcriptionService.transcribe(audioBuffer);
  console.log('done');
  return result;
}
```

## Testing

Currently, the project lacks comprehensive testing (alpha status). We welcome contributions to:

- Add Jest testing framework
- Create unit tests for core components
- Add integration tests for audio processing
- Implement end-to-end testing

```bash
# When tests are available
npm test

# Test coverage
npm run test:coverage
```

## Pull Request Process

### Before Submitting

1. **Create an issue** first to discuss significant changes
2. **Fork the repository** and create a feature branch
3. **Follow code style** guidelines
4. **Test your changes** locally
5. **Update documentation** if needed

### PR Guidelines

1. **Use clear titles**: `fix: resolve speaker diarization accuracy issue`
2. **Write good descriptions**:
   - What changes were made
   - Why they were necessary
   - How to test the changes
   - Any breaking changes
3. **Keep PRs focused**: One feature/fix per PR
4. **Update CHANGELOG.md** if applicable

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Audio capture works
- [ ] Transcription works
- [ ] No console errors

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No sensitive data committed
```

## Issue Guidelines

### Bug Reports

Use this template:

```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Step one
2. Step two
3. See error

**Expected Behavior**
What should happen

**Environment**
- macOS version:
- Node.js version:
- BlackHole version:

**Logs**
```
Paste relevant logs here
```

**Additional Context**
Any other relevant information
```

### Feature Requests

Use this template:

```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this work?

**Alternatives Considered**
Other approaches you've thought about

**Roadmap Alignment**
Does this align with our [roadmap](IMPROVEMENT_RECOMMENDATIONS.md)?
```

## Roadmap

Our current focus areas (see [IMPROVEMENT_RECOMMENDATIONS.md](IMPROVEMENT_RECOMMENDATIONS.md) for details):

### Phase 1: Foundation
- AssemblyAI SDK integration
- Speaker diarization improvements
- Real-time streaming transcription
- Error handling and logging

### Phase 2: AI Features
- AssemblyAI Audio Intelligence
- LeMUR meeting analysis
- Advanced speaker management
- GUI interface

### Phase 3: User Experience
- Live transcript editing
- Audio playback synchronization
- Annotation system
- Advanced search

## Security

- **Never commit** API keys, passwords, or sensitive data
- **Use environment variables** for configuration
- **Review dependencies** for security vulnerabilities
- **Report security issues** privately (see [SECURITY.md](SECURITY.md))

## Questions?

- **General questions**: GitHub Discussions
- **Bug reports**: GitHub Issues
- **Security issues**: See [SECURITY.md](SECURITY.md)

## Recognition

Contributors will be acknowledged in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor statistics

Thank you for contributing to Meeting Transcriber! 🎉