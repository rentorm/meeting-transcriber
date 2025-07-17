# Security Policy

## Supported Versions

As this project is currently in ALPHA stage, security updates are provided only for the latest version:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

We take the security of Meeting Transcriber seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

### How to Report

1. **Create a private security advisory**: Use GitHub's security advisory feature on this repository
2. **Subject**: Use "Security Vulnerability in Meeting Transcriber"
3. **Include**:
   - Type of issue (e.g., API key exposure, data leak, etc.)
   - Full paths of source file(s) related to the issue
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact assessment

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution Timeline**: Varies based on severity

### Security Best Practices for Users

1. **API Keys**:
   - Never commit `.env` files
   - Use environment variables for all sensitive data
   - Rotate API keys regularly

2. **Audio Privacy**:
   - Be aware that all meeting audio is processed through third-party APIs
   - Consider local transcription alternatives for sensitive meetings
   - Delete transcripts after use if they contain sensitive information

3. **Database Security**:
   - The SQLite database is stored locally without encryption
   - Ensure proper file permissions on `meetings.db`
   - Consider full-disk encryption for sensitive environments

4. **Dependencies**:
   - Regularly update dependencies with `npm update`
   - Check for vulnerabilities with `npm audit`
   - Review security advisories for BlackHole and audio tools

## Known Security Considerations

1. **API Data Transmission**: Audio is sent to OpenAI/AssemblyAI for processing
2. **Local Storage**: Transcripts are stored in unencrypted SQLite database
3. **System Audio Capture**: Requires system-level audio permissions
4. **No Authentication**: The app currently has no user authentication

## Future Security Enhancements

- [ ] Add database encryption
- [ ] Implement API key encryption at rest
- [ ] Add option for local-only transcription
- [ ] Implement user authentication
- [ ] Add audit logging

## Disclosure Policy

- Security vulnerabilities will be disclosed after a fix is available
- Credits will be given to reporters (unless anonymity is requested)
- CVEs will be requested for significant vulnerabilities