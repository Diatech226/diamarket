#!/usr/bin/env node
import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const apps = {
  diamarket: ['apps/diamarket-web', 'apps/diamarket-cms', 'apps/diamarket-api'],
  diapay: ['apps/diapay-api', 'apps/diapay-dashboard', 'apps/diapay-docs', 'apps/diapay-sandbox'],
  diaexpress: ['apps/diaexpress-web', 'apps/diaexpress-admin', 'apps/diaexpress-api'],
};
apps.all = [...apps.diamarket, ...apps.diapay, ...apps.diaexpress];

const target = process.argv[2] ?? 'all';
const selectedApps = apps[target];
if (!selectedApps) {
  console.error(`Unknown dev target "${target}".`);
  console.error(`Usage: npm run dev:${Object.keys(apps).filter((key) => key !== 'all').join('|dev:')} or npm run dev:all`);
  process.exit(1);
}

console.log(`Starting ${target} dev apps: ${selectedApps.join(', ')}`);
const children = selectedApps.map((appPath) => {
  const args = ['--prefix', appPath, 'run', 'dev'];
  console.log(`[${appPath}] > ${npmCommand} ${args.join(' ')}`);
  return { name: appPath, process: spawn(npmCommand, args, { stdio: 'inherit', env: process.env, shell: process.platform === 'win32' }) };
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
    console.error(`[${child.name}] failed to start npm dev process: ${error.message}`);
    stopAll();
    process.exit(1);
  });
  child.process.on('exit', (code, signal) => {
    if (shuttingDown) return;
    const exitCode = code ?? (signal ? 1 : 0);
    if (exitCode !== 0) {
      console.error(`[${child.name}] dev process exited with ${signal ?? `code ${exitCode}`}. Stopping the remaining apps.`);
      stopAll();
      process.exit(exitCode);
    }
  });
}
