#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { Command } from 'commander';

// Initialize commander
const program = new Command();

// Function to check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Function to write a file if it doesn't exist
const writeFileIfNotExists = (filePath, content) => {
  if (!fileExists(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created ${filePath}`);
  } else {
    console.log(`${filePath} already exists`);
  }
};

// Define the init command
program
  .command('init')
  .description('Initialize the .gitmdx folder and configuration')
  .action(() => {
    // Get the current working directory
    const cwd = process.cwd();

    // Determine if the project is TypeScript or JavaScript
    const isTypeScriptProject = fileExists(path.join(cwd, 'tsconfig.json'));

    // Create the .gitmdx folder and config file
    const gitmdxFolder = path.join(cwd, '.gitmdx');
    if (!fileExists(gitmdxFolder)) {
      fs.mkdirSync(gitmdxFolder);
      console.log('Created .gitmdx folder');
    }

    const configFile = path.join(gitmdxFolder, isTypeScriptProject ? 'config.ts' : 'config.js');
    writeFileIfNotExists(configFile, `// ${isTypeScriptProject ? 'TypeScript' : 'JavaScript'} config file`);

    // Add .gitmdx to .gitignore
    const gitignorePath = path.join(cwd, '.gitignore');
    const gitignoreContent = fileExists(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';

    if (!gitignoreContent.includes('.gitmdx')) {
      fs.appendFileSync(gitignorePath, '\n.gitmdx\n');
      console.log('Added .gitmdx to .gitignore');
    } else {
      console.log('.gitmdx already in .gitignore');
    }

    // Add gitmdx script to package.json
    const packageJsonPath = path.join(cwd, 'package.json');
    if (fileExists(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      if (!packageJson.scripts.gitmdx) {
        packageJson.scripts.gitmdx = 'npm build';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
        console.log('Added gitmdx script to package.json');
      } else {
        console.log('gitmdx script already exists in package.json');
      }
    } else {
      console.error('package.json not found in the current directory');
    }
  });

// Define the serve command
program
  .command('serve')
  .description('Run the Remix server in ../packages/editor')
  .action(() => {
    const cwd = process.cwd();
    const editorPath = path.join(cwd, './node_modules/@kode/gitmdx/packages/editor');
    if (!fileExists(editorPath)) {
      console.error(`The directory ${editorPath} does not exist.`);
      process.exit(1);
    }
    console.log(`The directory ${editorPath} exists.`);

    const command = 'pnpm run dev';
    exec(command, { cwd: editorPath }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
    });
  });

// Parse command-line arguments
program.parse(process.argv);

// Default action if no command is provided
if (!process.argv.slice(2).length) {
  program.help();
}
