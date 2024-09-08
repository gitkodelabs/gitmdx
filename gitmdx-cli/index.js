#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { Command } from "commander";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const program = new Command();

const editorPath = path.join(__dirname, "/packages/editor");

program
  .command("init")
  .description("Initialize the .gitmdx folder and configuration")
  .action(() => {
    console.log(__dirname);
  });

program
  .command("serve")
  .description("Serve gitmdx editor")
  .action(() => {
    console.log(editorPath);
    exec(`npm run dev`, { cwd: editorPath }, (error, stdout, stderr) => {
      console.log("exic");

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
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
