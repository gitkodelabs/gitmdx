#!/usr/bin/env node

import { exec } from 'child_process';

const scriptName = 'test'; 

exec(`npm run ${scriptName}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing script: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  console.log(`stdout: ${stdout}`);
});