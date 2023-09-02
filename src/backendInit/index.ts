import inquirer from 'inquirer';
import cp from 'child_process';
import fs from 'fs';

import { cargoConfig, mainFile, errorHandling, defaultStructs, exampleRoute, routeConfig, routeMod} from './boilerplate';

export async function createNewBackend() {
  // Get name choice
  let name: string;
	await inquirer.prompt({
		name: 'nameChoice',
		type: 'input',
		message: 'What we calling that thang?',
	}).then(async (useCase) => {
    name = useCase.nameChoice;
	});

  // Create new cargo project
  cp.execSync(`cargo new ${name}`);
  generateBoilerplate(name);
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
  fs.writeFile(`${projName}/src/stucts.rs`, defaultStructs(), err => {
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
  fs.writeFile(`${projName}/src/config.rs`, routeConfig(), err => {
    if (err) { console.log('Failed to create src/routes/config.rs !') };
  });

  // Write the src/routes/mod.rs file
  fs.writeFile(`${projName}/src/mod.rs`, routeMod(), err => {
    if (err) { console.log('Failed to create src/routes/mod.rs !') };
  });


}
