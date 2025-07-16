import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { Session, Transcript } from './types';
import { MeetingAnalysis } from './meetingAnalyzer';

export class UI {
  async showMainMenu(): Promise<string> {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Meeting Transcriber - What would you like to do?',
        choices: [
          { name: '🎙️  Start new meeting transcription', value: 'new' },
          { name: '📚 View previous meetings', value: 'view' },
          { name: '🔍 Search transcripts', value: 'search' },
          { name: '📤 Export meeting', value: 'export' },
          { name: '⚙️  Audio setup instructions', value: 'setup' },
          { name: '❌ Exit', value: 'exit' }
        ]
      }
    ]);
    return choice;
  }

  async getMeetingDetails(): Promise<{ name: string; participants: string }> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Meeting name/title:',
        default: `Meeting ${new Date().toLocaleString()}`
      },
      {
        type: 'input',
        name: 'participants',
        message: 'Participants (comma-separated, optional):',
        default: ''
      }
    ]);
    return answers;
  }

  displayLiveTranscript(speaker: string, text: string, confidence: number): void {
    const timestamp = new Date().toLocaleTimeString();
    const confidenceIndicator = confidence > 0.8 ? '●' : confidence > 0.5 ? '◐' : '○';
    
    const speakerColor = speaker === 'You' ? chalk.blue : 
                        speaker.includes('1') ? chalk.green :
                        speaker.includes('2') ? chalk.yellow : chalk.magenta;
    
    console.log(
      `${chalk.gray(timestamp)} ${confidenceIndicator} ${speakerColor(speaker)}: ${chalk.white(text)}`
    );
  }

  displayMeetingHeader(name: string, participants: string): void {
    console.clear();
    console.log(chalk.bold.blue('╔═══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.blue('║') + chalk.bold.white('  🎙️  Meeting Transcription in Progress') + chalk.bold.blue('                       ║'));
    console.log(chalk.bold.blue('╠═══════════════════════════════════════════════════════════════╣'));
    console.log(chalk.bold.blue('║') + chalk.white(` Meeting: ${name.padEnd(52)}`) + chalk.bold.blue('║'));
    if (participants) {
      console.log(chalk.bold.blue('║') + chalk.white(` Participants: ${participants.padEnd(47)}`) + chalk.bold.blue('║'));
    }
    console.log(chalk.bold.blue('║') + chalk.gray(' Press Ctrl+C to stop recording') + chalk.bold.blue('                              ║'));
    console.log(chalk.bold.blue('╚═══════════════════════════════════════════════════════════════╝'));
    console.log('');
  }

  showRecordingStatus(): ora.Ora {
    return ora({
      text: 'Recording audio from microphone and system...',
      spinner: 'dots',
      color: 'red'
    }).start();
  }

  showProcessingStatus(text: string = 'Processing audio...'): ora.Ora {
    return ora({
      text,
      spinner: 'dots',
      color: 'yellow'
    }).start();
  }

  async showAudioSetup(): Promise<void> {
    console.clear();
    console.log(chalk.bold.blue('Audio Setup Instructions for macOS'));
    console.log(chalk.blue('═'.repeat(60)));
    console.log('\n' + chalk.bold('To capture system audio (calls, meetings, etc.):'));
    console.log('\n1. ' + chalk.yellow('Install BlackHole Audio Driver:'));
    console.log('   brew install blackhole-2ch');
    console.log('   OR download from: https://github.com/ExistentialAudio/BlackHole');
    
    console.log('\n2. ' + chalk.yellow('Create Multi-Output Device:'));
    console.log('   • Open "Audio MIDI Setup" (in /Applications/Utilities/)');
    console.log('   • Click "+" button → "Create Multi-Output Device"');
    console.log('   • Check both "BlackHole 2ch" and your speakers/headphones');
    console.log('   • Name it "Multi-Output Device"');
    
    console.log('\n3. ' + chalk.yellow('Set as System Output:'));
    console.log('   • Option-click the volume icon in menu bar');
    console.log('   • Select "Multi-Output Device" as output');
    
    console.log('\n4. ' + chalk.yellow('Verify Setup:'));
    console.log('   • You should still hear audio through your speakers');
    console.log('   • The app will capture audio through BlackHole');
    
    console.log('\n' + chalk.green('✓ Once setup, all system audio will be captured!'));
    console.log(chalk.gray('\nNote: Remember to switch back to normal output when done.'));
    
    await this.waitForKeyPress();
  }

  displayAnalysis(analysis: MeetingAnalysis): void {
    console.log('\n' + chalk.bold.blue('Meeting Analysis'));
    console.log(chalk.blue('═'.repeat(60)));
    
    console.log('\n' + chalk.bold('Duration:') + ` ${Math.round(analysis.totalDuration)} minutes`);
    console.log(chalk.bold('Total Words:') + ` ${analysis.wordCount}`);
    console.log(chalk.bold('Speakers:') + ` ${analysis.speakers.join(', ')}`);
    
    console.log('\n' + chalk.bold('Talk Time:'));
    Object.entries(analysis.talkTime).forEach(([speaker, time]) => {
      const minutes = Math.round(time / 60);
      const percentage = Math.round((time / (analysis.totalDuration * 60)) * 100);
      console.log(`  ${speaker}: ${minutes}min (${percentage}%)`);
    });
    
    console.log('\n' + chalk.bold('Keywords:') + ` ${analysis.keywords.join(', ')}`);
    console.log('\n' + chalk.bold('Summary:'));
    console.log(chalk.gray(analysis.summary));
  }

  async selectSession(sessions: Session[]): Promise<number | null> {
    if (sessions.length === 0) {
      console.log(chalk.yellow('No meetings found.'));
      return null;
    }

    const choices = sessions.map(s => {
      const duration = s.endTime 
        ? `${Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000)}min`
        : 'In progress';
      
      return {
        name: `${s.name} - ${new Date(s.startTime).toLocaleString()} (${duration})`,
        value: s.id
      };
    });

    const { sessionId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'sessionId',
        message: 'Select a meeting:',
        choices: [...choices, { name: '← Back', value: null }],
        pageSize: 10
      }
    ]);

    return sessionId;
  }

  async getSearchQuery(): Promise<string> {
    const { query } = await inquirer.prompt([
      {
        type: 'input',
        name: 'query',
        message: 'Search transcripts for:'
      }
    ]);
    return query;
  }

  async getExportFormat(): Promise<'json' | 'txt' | 'srt'> {
    const { format } = await inquirer.prompt([
      {
        type: 'list',
        name: 'format',
        message: 'Export format:',
        choices: [
          { name: 'JSON (structured data)', value: 'json' },
          { name: 'Text (readable transcript)', value: 'txt' },
          { name: 'SRT (subtitle format)', value: 'srt' }
        ]
      }
    ]);
    return format;
  }

  displayTranscripts(transcripts: Transcript[]): void {
    console.clear();
    console.log(chalk.blue('═'.repeat(80)));
    console.log(chalk.blue.bold('Meeting Transcript'));
    console.log(chalk.blue('═'.repeat(80)));

    let currentSpeaker = '';
    transcripts.forEach(t => {
      const timestamp = new Date(t.timestamp).toLocaleTimeString();
      
      if (t.speaker !== currentSpeaker) {
        console.log(''); // New line for speaker change
        currentSpeaker = t.speaker;
      }
      
      const speakerColor = t.speaker === 'You' ? chalk.blue : 
                          t.speaker.includes('1') ? chalk.green :
                          t.speaker.includes('2') ? chalk.yellow : chalk.magenta;
      
      console.log(`${chalk.gray(timestamp)} ${speakerColor(t.speaker)}: ${chalk.white(t.text)}`);
    });

    console.log(chalk.blue('\n' + '═'.repeat(80)));
  }

  async waitForKeyPress(): Promise<void> {
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
      }
    ]);
  }
}