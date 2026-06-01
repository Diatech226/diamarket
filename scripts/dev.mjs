#!/usr/bin/env node
import { spawn } from 'node:child_process';

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const apps = {
  diamarket: ['diamarket-web', 'diamarket-cms', 'diamarket-api'],
  diapay: ['diapay-api', 'diapay-dashboard', 'diapay-docs', 'diapay-sandbox'],
  diaexpress: ['diaexpress-web', 'diaexpress-admin', 'diaexpress-api'],
};

apps.all = [...apps.diamarket, ...apps.diapay, ...apps.diaexpress];

const target = process.argv[2] ?? 'all';
const selectedApps = apps[target];

if (!selectedApps) {
  console.error(`Unknown dev target "${target}".`);
  console.error(`Usage: pnpm dev:${Object.keys(apps).filter((key) => key !== 'all').join('|dev:')} or pnpm dev:all`);
  process.exit(1);
}

console.log(`Starting ${target} dev apps: ${selectedApps.join(', ')}`);

const children = selectedApps.map((appName) => {
  const args = ['--filter', appName, 'dev'];
  console.log(`[${appName}] > ${command} ${args.join(' ')}`);
  return {
    name: appName,
    process: spawn(command, args, {
      stdio: 'inherit',
      env: process.env,
      shell: process.platform === 'win32',
    }),
  };
});

let shuttingDown = false;

const stopAll = (signal = 'SIGTERM') => {
  shuttingDown = true;
  for (const child of children) {
    if (!child.process.killed) child.process.kill(signal);
  }
};

process.on('SIGINT', () => stopAll('SIGINT'));
process.on('SIGTERM', () => stopAll('SIGTERM'));

for (const child of children) {
  child.process.on('error', (error) => {
    if (shuttingDown) return;

    console.error(`[${child.name}] failed to start pnpm dev process: ${error.message}`);
    stopAll('SIGTERM');
    process.exit(1);
  });

  child.process.on('exit', (code, signal) => {
    if (shuttingDown) return;

    const exitCode = code ?? (signal ? 1 : 0);
    if (exitCode !== 0) {
      console.error(`[${child.name}] dev process exited with ${signal ?? `code ${exitCode}`}. Stopping the remaining apps.`);
      stopAll('SIGTERM');
      process.exit(exitCode);
    }
  });
}
