import { spawn } from 'node:child_process';

const port = '0';
const child = spawn(process.execPath, ['src/server.js'], {
  cwd: new URL('..', import.meta.url),
  env: { ...process.env, PORT: port },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
child.stdout.on('data', (chunk) => { output += chunk.toString(); });
child.stderr.on('data', (chunk) => { output += chunk.toString(); });

const timeout = setTimeout(() => {
  child.kill('SIGTERM');
  console.error('Backend smoke test timed out.');
  process.exit(1);
}, 15000);

child.on('exit', (code) => {
  clearTimeout(timeout);
  if (code === 0 || /listening|ready|started/i.test(output)) {
    process.exit(0);
  }
  console.error(output);
  process.exit(code || 1);
});
