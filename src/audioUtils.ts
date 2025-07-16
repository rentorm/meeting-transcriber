export class AudioUtils {
  /**
   * Properly concatenate WAV buffers by extracting PCM data and creating a new WAV file
   * @param buffers Array of WAV buffers to combine
   * @returns Single WAV buffer with proper headers
   */
  static combineWavBuffers(buffers: Buffer[]): Buffer {
    if (buffers.length === 0) return Buffer.alloc(0);
    if (buffers.length === 1) return buffers[0];

    // Extract PCM data from each buffer (skip WAV header)
    const pcmChunks: Buffer[] = [];
    let totalPcmSize = 0;
    let sampleRate = 16000;
    let numChannels = 1;
    let bitsPerSample = 16;

    for (const buffer of buffers) {
      if (buffer.length < 44) continue; // Skip if too small to contain WAV header

      // Read WAV header info from first valid buffer
      if (pcmChunks.length === 0 && this.isValidWavBuffer(buffer)) {
        try {
          // Safely read WAV header values with bounds checking
          sampleRate = buffer.readUInt32LE(24);
          numChannels = buffer.readUInt16LE(22);
          bitsPerSample = buffer.readUInt16LE(34);
          
          // Validate reasonable values
          if (sampleRate < 8000 || sampleRate > 48000) sampleRate = 16000;
          if (numChannels < 1 || numChannels > 2) numChannels = 1;
          if (bitsPerSample !== 16 && bitsPerSample !== 8) bitsPerSample = 16;
        } catch (error) {
          // Use defaults if reading fails
          sampleRate = 16000;
          numChannels = 1;
          bitsPerSample = 16;
        }
      }

      // Extract PCM data (everything after the 44-byte WAV header)
      const pcmData = buffer.subarray(44);
      pcmChunks.push(pcmData);
      totalPcmSize += pcmData.length;
    }

    if (totalPcmSize === 0) return Buffer.alloc(0);

    // Validate totalPcmSize is reasonable
    if (totalPcmSize > 100 * 1024 * 1024) { // 100MB limit
      console.warn('Combined audio buffer too large, truncating');
      totalPcmSize = 100 * 1024 * 1024;
    }

    // Create new WAV buffer with proper header
    const wavBuffer = Buffer.alloc(44 + totalPcmSize);
    
    // Calculate byte rate safely
    const byteRate = Math.min(sampleRate * numChannels * bitsPerSample / 8, 4294967295);
    const blockAlign = numChannels * bitsPerSample / 8;
    
    // WAV header
    wavBuffer.write('RIFF', 0);
    wavBuffer.writeUInt32LE(36 + totalPcmSize, 4);
    wavBuffer.write('WAVE', 8);
    wavBuffer.write('fmt ', 12);
    wavBuffer.writeUInt32LE(16, 16); // PCM format chunk size
    wavBuffer.writeUInt16LE(1, 20);  // Audio format (1 = PCM)
    wavBuffer.writeUInt16LE(numChannels, 22);
    wavBuffer.writeUInt32LE(sampleRate, 24);
    wavBuffer.writeUInt32LE(byteRate, 28); // Byte rate
    wavBuffer.writeUInt16LE(blockAlign, 32); // Block align
    wavBuffer.writeUInt16LE(bitsPerSample, 34);
    wavBuffer.write('data', 36);
    wavBuffer.writeUInt32LE(totalPcmSize, 40);

    // Copy PCM data
    let offset = 44;
    let remainingSize = totalPcmSize;
    
    for (const pcmChunk of pcmChunks) {
      if (remainingSize <= 0) break;
      
      const bytesToCopy = Math.min(pcmChunk.length, remainingSize);
      pcmChunk.subarray(0, bytesToCopy).copy(wavBuffer, offset);
      offset += bytesToCopy;
      remainingSize -= bytesToCopy;
    }

    return wavBuffer;
  }

  /**
   * Validate if a buffer contains valid WAV data
   * @param buffer Buffer to validate
   * @returns true if buffer appears to be valid WAV format
   */
  static isValidWavBuffer(buffer: Buffer): boolean {
    if (buffer.length < 44) return false;
    
    // Check for RIFF header
    if (buffer.toString('ascii', 0, 4) !== 'RIFF') return false;
    
    // Check for WAVE format
    if (buffer.toString('ascii', 8, 12) !== 'WAVE') return false;
    
    // Check for fmt chunk
    if (buffer.toString('ascii', 12, 16) !== 'fmt ') return false;
    
    return true;
  }
}