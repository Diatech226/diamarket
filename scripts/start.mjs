#!/usr/bin/env node
import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const apps = {
  diamarket: ['apps/diamarket-api', 'apps/diamarket-web', 'apps/diamarket-cms'],
};

const target = process.argv[2] ?? 'diamarket';
const selectedApps = apps[target];
if (!selectedApps) {
  console.error(`Unknown start target "${target}".`);
  console.error('Usage: npm start or node scripts/start.mjs diamarket');
  process.exit(1);
}

console.log(`Starting ${target} apps: ${selectedApps.join(', ')}`);
const children = selectedApps.map((appPath) => {
  const args = ['--prefix', appPath, 'start'];
  console.log(`[${appPath}] > ${npmCommand} ${args.join(' ')}`);
  return {
    name: appPath,
    process: spawn(npmCommand, args, {
      stdio: 'inherit',
      env: process.env,
      shell: process.platform === 'win32',
    }),
  };
});

let shuttingDown = false;
const stopAll = (signal = 'SIGTERM') => {
  shuttingDown = true;
  for (const child of children) if (!child.process.killed) child.process.kill(signal);
};

process.on('SIGINT', () => stopAll('SIGINT'));
process.on('SIGTERM', () => stopAll('SIGTERM'));

for (const child of children) {
  child.process.on('error', (error) => {
    if (shuttingDown) return;
    console.error(`[${child.name}] failed to start npm process: ${error.message}`);
    stopAll();
    process.exit(1);
  });
  child.process.on('exit', (code, signal) => {
    if (shuttingDown) return;
    const exitCode = code ?? (signal ? 1 : 0);
    if (exitCode !== 0) {
      console.error(`[${child.name}] start process exited with ${signal ?? `code ${exitCode}`}. Stopping the remaining apps.`);
      stopAll();
      process.exit(exitCode);
    }
  });
}
