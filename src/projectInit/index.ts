import inquirer from 'inquirer';
import cp from 'child_process';
import fs from 'fs';
import confirm from '@inquirer/confirm';
import { select } from '@inquirer/prompts';


import { 
  cargoConfig, mainFile, errorHandling, 
  defaultStructs, exampleRoute, routeConfig, 
  routeMod, webRoutes, webServices
} from './boilerplate.js';

export async function createNewProject() {
  // Get name choice
  let name: string;
	await inquirer.prompt({
		name: 'nameChoice',
		type: 'input',
		message: 'What we calling that thang?',
	}).then(async (useCase) => {
    name = useCase.nameChoice;
	});

  // Check if project needs a web frontend
  const needsWebFrontend = await confirm({ message: 'Does this project need a Web Frontend?' });

  // Create new cargo project
  cp.execSync(`cargo new ${name}`);
  generateBoilerplate(name);

  if (needsWebFrontend) {
    const jsFlavor = await select({ 
      message: 'What JavaScript (TS) Flavor ?',
      choices: [
        { name: 'Vanilla', value: 'vanilla-ts' },
        { name: 'React', value: 'react-ts' },
        { name: 'Preact', value: 'preact-ts' },
        { name: 'Svelte', value: 'svelte-ts' },
        { name: 'Qwick', value: 'qwick-ts' },
      ]
    });
    createViteApp(name, jsFlavor);
    integrateWebFrontend(name);
  }
}


async function generateBoilerplate(projName: string) {
  // Write the Cargo.toml file
  fs.writeFile(`${projName}/Cargo.toml`, cargoConfig(projName), err => {
    if (err) {
      console.log('Failed to create Cargo.toml !');
    }
  });

  // Write the src/main.rs file
  fs.writeFile(`${projName}/src/main.rs`, mainFile(projName), err => {
    if (err) {
      console.log('Failed to create src/main.rs !');
    }
  });

  // Write the src/error.rs file
  fs.writeFile(`${projName}/src/error.rs`, errorHandling(projName), err => {
    if (err) {
      console.log('Failed to create src/error.rs !');
    }
  });

  // Write the src/structs.rs file
  fs.writeFile(`${projName}/src/structs.rs`, defaultStructs(), err => {
    if (err) {
      console.log('Failed to create src/structs.rs !');
    }
  });

  // Create the src/routes directory
  // do this synchronously so the code
  // below this can't run until routes
  // directory is created
  fs.mkdirSync(`${projName}/src/routes`)

  // Write the src/routes/example.rs file
  fs.writeFile(`${projName}/src/routes/example.rs`, exampleRoute(projName), err => {
    if (err) { console.log('Failed to create src/structs.rs !') };
  });

  // Write the src/routes/config.rs file
  fs.writeFile(`${projName}/src/routes/config.rs`, routeConfig(), err => {
    if (err) { console.log('Failed to create src/routes/config.rs !') };
  });

  // Write the src/routes/mod.rs file
  fs.writeFile(`${projName}/src/routes/mod.rs`, routeMod(), err => {
    if (err) { console.log('Failed to create src/routes/mod.rs !') };
  });
}

async function createViteApp(projName: string, jsFlavor: string) {
  // Go into ./src/ 
  process.chdir(`${projName}/src`);

  // Create a vite app (React, Typescript, SWC)
  cp.execSync(`npm create vite@latest web -- --template ${jsFlavor} --jsx swc`);

  // Go back to dir we started at
  process.chdir('../..');
}

async function integrateWebFrontend(projName: string) {
  // Create src/routes/web.rs and insert boilerplate
  fs.writeFile(`${projName}/src/routes/web.rs`, webRoutes(projName), err => {
    if (err) { console.log('Failed to create src/routes/web.rs !') };
  });

  // Update the src/routes/mod.rs to add the new web.rs
  fs.readFile(`${projName}/src/routes/mod.rs`, 'utf8', (err, data) => {
    if (err) { console.log('Failed to read routes module !') }
    else {
      let updatedData = data + '\n' + 'pub mod web;';
      fs.writeFile(`${projName}/src/routes/mod.rs`, updatedData, err => {
        if (err) { console.log('Failed to update routes module !') };
      });
    };
  });

  // Update the src/routes/config.rs to add the web routes
  fs.readFile(`${projName}/src/routes/config.rs`, 'utf8', (err, data) => {
    if (err) { console.log('Failed to read routes config !') }
    else {
      const idxLastSemicolon = data.lastIndexOf(';');
      let updatedData = data.substring(0, idxLastSemicolon) + webServices();
      fs.writeFile(`${projName}/src/routes/config.rs`, updatedData, err => {
        if (err) { console.log('Failed to update routes config !') };
      });
    };
  });

  // Add actix-files dependency
  fs.readFile(`${projName}/Cargo.toml`, 'utf8', (err, data) => {
    if (err) { console.log('Failed to read Cargo.toml !') }
    else {
      let updatedData = data + "\nactix-files = \"0.6.2\"";
      fs.writeFile(`${projName}/Cargo.toml`, updatedData, err => {
        if (err) { console.log('Failed to update Cargo.toml !') };
      });
    };
  });
}


