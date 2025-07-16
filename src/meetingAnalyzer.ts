import { Transcript } from './types';

export class MeetingAnalyzer {
  analyzeMeeting(transcripts: Transcript[]): MeetingAnalysis {
    const speakers = this.identifySpeakers(transcripts);
    const talkTime = this.calculateTalkTime(transcripts);
    const keywords = this.extractKeywords(transcripts);
    const summary = this.generateSummary(transcripts);

    return {
      speakers,
      talkTime,
      keywords,
      summary,
      totalDuration: this.calculateDuration(transcripts),
      wordCount: this.countWords(transcripts)
    };
  }

  private identifySpeakers(transcripts: Transcript[]): string[] {
    return [...new Set(transcripts.map(t => t.speaker))];
  }

  private calculateTalkTime(transcripts: Transcript[]): Record<string, number> {
    const talkTime: Record<string, number> = {};
    
    transcripts.forEach((t, i) => {
      if (!talkTime[t.speaker]) {
        talkTime[t.speaker] = 0;
      }
      
      // Estimate duration based on word count (average speaking rate: 150 words/min)
      const wordCount = t.text.split(' ').length;
      const duration = (wordCount / 150) * 60; // seconds
      talkTime[t.speaker] += duration;
    });

    return talkTime;
  }

  private extractKeywords(transcripts: Transcript[]): string[] {
    const text = transcripts.map(t => t.text).join(' ').toLowerCase();
    const words = text.split(/\W+/);
    
    // Simple keyword extraction - count word frequency
    const frequency: Record<string, number> = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    // Return top 10 keywords
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private generateSummary(transcripts: Transcript[]): string {
    // Simple summary: first and last few sentences
    if (transcripts.length === 0) return 'No transcripts available';
    
    const first = transcripts.slice(0, 3).map(t => t.text).join(' ');
    const last = transcripts.slice(-3).map(t => t.text).join(' ');
    
    return `Meeting started with: "${first}"... and concluded with: "${last}"`;
  }

  private calculateDuration(transcripts: Transcript[]): number {
    if (transcripts.length < 2) return 0;
    
    const start = new Date(transcripts[0].timestamp).getTime();
    const end = new Date(transcripts[transcripts.length - 1].timestamp).getTime();
    
    return (end - start) / 1000 / 60; // minutes
  }

  private countWords(transcripts: Transcript[]): number {
    return transcripts.reduce((sum, t) => sum + t.text.split(' ').length, 0);
  }
}

interface MeetingAnalysis {
  speakers: string[];
  talkTime: Record<string, number>;
  keywords: string[];
  summary: string;
  totalDuration: number;
  wordCount: number;
}