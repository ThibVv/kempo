#!/usr/bin/env node
import { spawn } from 'child_process';

const process = spawn('tsx', ['src/main.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

process.on('exit', (code) => {
  process.exit(code);
});
