const { spawn } = require('child_process');

const expoBin = require.resolve('expo/bin/cli');
const args = process.argv.slice(2);

const child = spawn(process.execPath, ['--max-old-space-size=4096', expoBin, ...args], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=4096',
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});