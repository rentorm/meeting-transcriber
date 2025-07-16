const { exec } = require('child_process');
const chalk = require('chalk');

console.log(chalk.bold.blue('Setting up audio for meeting transcription...\n'));

// Check if BlackHole is installed
exec('ls /Library/Audio/Plug-Ins/HAL/ | grep BlackHole', (error, stdout) => {
  if (error) {
    console.log(chalk.red('❌ BlackHole not found!'));
    console.log('\nPlease install BlackHole:');
    console.log('1. Visit: https://github.com/ExistentialAudio/BlackHole');
    console.log('2. Download BlackHole 2ch');
    console.log('3. Run the installer');
    console.log('\nOr install via Homebrew:');
    console.log(chalk.cyan('brew install blackhole-2ch'));
  } else {
    console.log(chalk.green('✅ BlackHole is installed'));
    
    // Check audio devices
    exec('system_profiler SPAudioDataType', (error, stdout) => {
      if (stdout.includes('BlackHole')) {
        console.log(chalk.green('✅ BlackHole audio device detected'));
        
        if (stdout.includes('Multi-Output Device')) {
          console.log(chalk.green('✅ Multi-Output Device found'));
          console.log('\n' + chalk.bold.green('Audio setup complete! You can start transcribing.'));
        } else {
          console.log(chalk.yellow('⚠️  Multi-Output Device not found'));
          console.log('\nPlease create it in Audio MIDI Setup:');
          console.log('1. Open Audio MIDI Setup');
          console.log('2. Click + → Create Multi-Output Device');
          console.log('3. Check both BlackHole and your speakers');
        }
      }
    });
  }
});

// Additional setup checks
exec('which ffmpeg', (error) => {
  if (error) {
    console.log(chalk.yellow('\n⚠️  FFmpeg not found'));
    console.log('Install with: ' + chalk.cyan('brew install ffmpeg'));
  } else {
    console.log(chalk.green('✅ FFmpeg is installed'));
  }
});

exec('which sox', (error) => {
  if (error) {
    console.log(chalk.yellow('\n⚠️  Sox not found'));
    console.log('Install with: ' + chalk.cyan('brew install sox'));
  } else {
    console.log(chalk.green('✅ Sox is installed'));
  }
});