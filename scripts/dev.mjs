#!/usr/bin/env node
import { spawn } from 'node:child_process';

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const apps = {
  diamarket: [
    { name: 'diamarket-web', path: 'apps/diamarket-web' },
    { name: 'diamarket-cms', path: 'apps/diamarket-cms' },
    { name: 'diamarket-api', path: 'apps/diamarket-api' },
  ],
  diapay: [
    { name: 'diapay-api', path: 'apps/diapay-api' },
    { name: 'diapay-dashboard', path: 'apps/diapay-dashboard' },
    { name: 'diapay-docs', path: 'apps/diapay-docs' },
    { name: 'diapay-sandbox', path: 'apps/diapay-sandbox' },
  ],
  diaexpress: [
    { name: 'diaexpress-client', path: 'apps/diaexpress-client' },
    { name: 'diaexpress-adminv2', path: 'apps/diaexpress-adminv2' },
    { name: 'diaexpress-backend', path: 'apps/services/diaexpress-backend' },
  ],
};

apps.all = [...apps.diamarket, ...apps.diapay, ...apps.diaexpress];

const target = process.argv[2] ?? 'all';
const selectedApps = apps[target];

if (!selectedApps) {
  console.error(`Unknown dev target "${target}".`);
  console.error(`Usage: pnpm dev [${Object.keys(apps).join('|')}]`);
  process.exit(1);
}

const spawnPnpm = (args) => {
  if (pnpmCli) {
    return spawn(process.execPath, [pnpmCli, ...args], {
      stdio: 'inherit',
      env: process.env,
    });
  }

  return spawn(pnpmExecutable, args, {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });
};

console.log(`Starting ${target} dev apps: ${selectedApps.map((app) => app.name).join(', ')}`);

const children = selectedApps.map((app) => {
  const args = ['--dir', app.path, 'run', 'dev'];
  console.log(`[${app.name}] > pnpm ${args.join(' ')}`);
  return {
    ...app,
    process: spawn(`${command} --dir ${app.path} run dev`, {
      stdio: 'inherit',
      env: process.env,
      shell: true,
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
