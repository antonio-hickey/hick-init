import inquirer from 'inquirer';
import cp from 'child_process';
import fs from 'fs';
import confirm from '@inquirer/confirm';
import { select } from '@inquirer/prompts';
import { needToDoMore } from '../index.js';


import { 
  cargoConfig, mainFile, errorHandling, 
  defaultStructs, exampleRoute, routeConfig, 
  routeMod, webRoutes, webServices, viteConfig
} from './boilerplate.js';
import { dashCaseToTitleCase } from '../util.js';

export async function createNewProject(): Promise<boolean> {
  // Get name choice
  let name: string;
  await inquirer.prompt({
    name: 'nameChoice',
    type: 'input',
    message: 'What we calling that thang?',
  }).then(async (useCase) => {
    name = useCase.nameChoice;
  });
  const codeSafeName = dashCaseToTitleCase(name);
  
  // Check if project needs a web frontend
  const needsWebFrontend = await confirm({ message: 'Does this project need a Web Frontend?' });
  
  // Create new cargo project
  cp.execSync(`cargo new ${name}`);
  generateBoilerplate(name, codeSafeName);
  
  if (needsWebFrontend) {
    const jsFlavor = await select({ 
      message: 'What JavaScript (TS) Flavor ?',
      choices: [
        { name: 'Vanilla', value: 'vanilla-ts' },
        { name: 'React', value: 'react-ts' },
      ]
    });
    createViteApp(name, jsFlavor);
    integrateTailwindCss();

    // Integrate the frontend with backend web server
    integrateWebFrontend(name, codeSafeName);
  }
  
  return await needToDoMore();
}


async function generateBoilerplate(projName: string, codeSafeName: string) {
  // Parses the proj name into a code safe string
  
  // Write the Cargo.toml file
  fs.writeFile(`${projName}/Cargo.toml`, cargoConfig(projName), err => {
    if (err) { console.log('Failed to create Cargo.toml !'); }
  });
  
  // Write the src/main.rs file
  fs.writeFile(`${projName}/src/main.rs`, mainFile(), err => {
    if (err) { console.log('Failed to create src/main.rs !'); }
  });
  
  // Write the src/error.rs file
  fs.writeFile(`${projName}/src/error.rs`, errorHandling(codeSafeName), err => {
    if (err) { console.log('Failed to create src/error.rs !'); }
  });
  
  // Write the src/structs.rs file
  fs.writeFile(`${projName}/src/structs.rs`, defaultStructs(), err => {
    if (err) { console.log('Failed to create src/structs.rs !'); }
  });
  
  // Create the src/routes directory
  // do this synchronously so the code
  // below this can't run until routes
  // directory is created
  fs.mkdirSync(`${projName}/src/routes`);
  
  // Write the src/routes/example.rs file
  fs.writeFile(`${projName}/src/routes/example.rs`, exampleRoute(codeSafeName), err => {
    if (err) { console.log('Failed to create src/structs.rs !'); }
  });
  
  // Write the src/routes/config.rs file
  fs.writeFile(`${projName}/src/routes/config.rs`, routeConfig(), err => {
    if (err) { console.log('Failed to create src/routes/config.rs !'); }
  });
  
  // Write the src/routes/mod.rs file
  fs.writeFile(`${projName}/src/routes/mod.rs`, routeMod(), err => {
    if (err) { console.log('Failed to create src/routes/mod.rs !'); }
  });
}

async function createViteApp(projName: string, jsFlavor: string) {
  // Go into ./src/ 
  process.chdir(`${projName}/src`);
  
  // Create a vite app (React, Typescript, SWC)
  cp.execSync(`npm create vite@latest web -- --template ${jsFlavor} --jsx swc`);

  // Configure vite
  fs.writeFile(`web/vite.config.ts`, viteConfig(), err => {
    if (err) { console.log('Failed to configure vite!', err); }
  });

  // Add deps
  let data = fs.readFileSync('web/package.json').toString();

  const jsonData = JSON.parse(data);
  jsonData['devDependencies']['@types/node'] = '^20.10.5';
  jsonData['devDependencies']['@vitejs/plugin-react-swc'] = '^3.7.0';

  fs.writeFileSync(`web/package.json`, JSON.stringify(jsonData, null, 2));
}

async function integrateTailwindCss() {
  // Go into web directory
  process.chdir(`web`);

  // Add tailwind dependencies
  const packageData = fs.readFileSync(`package.json`, 'utf8').toString();
  const packageJsonData = JSON.parse(packageData);
  packageJsonData['devDependencies']['tailwindcss'] = '3.4.10';
  packageJsonData['devDependencies']['postcss'] = '8.4.41';
  packageJsonData['devDependencies']['autoprefixer'] = '10.4.20';

  fs.writeFileSync(`package.json`, JSON.stringify(packageJsonData, null, 2));

  // Initialize tailwindcss
  cp.execSync('npx tailwindcss init -p');

  // Add paths for tailwind to know where to read classes from
  let tailwindConfigData = fs.readFileSync('tailwind.config.js', 'utf8')
    .toString();
  tailwindConfigData = tailwindConfigData
    .replace(
      'content: []', 
      `content: [\n    "./index.html",\n    "./src/**/*.{js,ts,jsx,tsx}",\n  ]`
    );

  fs.writeFileSync('tailwind.config.js', tailwindConfigData);

  // Add tailwind directives to index.css
  fs.writeFileSync(
    'src/index.css', 
    '@tailwind base;\n@tailwind components;\n@tailwind utilities;',
  );

  // Go back to project root
  process.chdir('../../..');
}

async function integrateWebFrontend(projName: string, codeSafeName: string) {
  // Create src/routes/web.rs and insert boilerplate
  fs.writeFile(`${projName}/src/routes/web.rs`, webRoutes(codeSafeName), err => {
    if (err) { console.log('Failed to create src/routes/web.rs !'); }
  });
  
  // Update the src/routes/mod.rs to add the new web.rs
  fs.readFile(`${projName}/src/routes/mod.rs`, 'utf8', (err, data) => {
    if (err) { console.log('Failed to read routes module !'); }
    else {
      const updatedData = data + '\n' + 'pub mod web;';
      fs.writeFile(`${projName}/src/routes/mod.rs`, updatedData, err => {
        if (err) { console.log('Failed to update routes module !'); }
      });
    }
  });
  
  // Update the src/routes/config.rs to add the web routes
  fs.readFile(`${projName}/src/routes/config.rs`, 'utf8', (err, data) => {
    if (err) { console.log('Failed to read routes config !'); }
    else {
      const idxLastSemicolon = data.lastIndexOf(';');
      const updatedData = data.substring(0, idxLastSemicolon) + webServices();
      fs.writeFile(`${projName}/src/routes/config.rs`, updatedData, err => {
        if (err) { console.log('Failed to update routes config !'); }
      });
    }
  });
  
  // Add actix-files dependency
  fs.readFile(`${projName}/Cargo.toml`, 'utf8', (err, data) => {
    if (err) { console.log('Failed to read Cargo.toml !'); }
    else {
      const updatedData = data + 'actix-files = "0.6.2"';
      fs.writeFile(`${projName}/Cargo.toml`, updatedData, err => {
        if (err) { console.log('Failed to update Cargo.toml !'); }
      });
    }
  });
}

