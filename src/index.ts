import inquirer from 'inquirer';
import { createNewProject } from './projectInit/index.js';

type UseCase = {
	desired_use: string
}

// Run main function
main();
async function main() {
  inquirer.prompt({
    name: 'desired_use',
    type: 'list',
    message: 'What you making today bro0oo?',
    choices: [
      'Create New Project',
      'Create New Web Scraper (! UNIMPLEMENTED !)',
      'Create New CLI (! UNIMPLEMENTED !)',
      'Exit'
    ],
    filter(val: string) {
      // make use case choice lowercase to reduce 
      // confusion throughout codebase.
      return val.toLowerCase();
    },
  }).then(async (useCase: UseCase) => {
    // Map the use case to functionality
    const finished = await handleUseCase(useCase.desired_use);
    if (!finished) { main(); }
  });
}

async function handleUseCase(useCase: string) {
  /* Get relevant functionality to run */
  // Map of use cases (key) and functions (value)
  const useCaseMap = {
    'create new project': createNewProject,
    'create new web scraper': '',
    'create new cli': '',
    'exit': () => true
  };
  
  // Call the function based on the use case
  return await useCaseMap[useCase]();
}

export async function needToDoMore(): Promise<boolean> {
  /* See if they want to exit or continue to new tasks */
  let exit = true;

  await inquirer.prompt({
    name: 'exit_choice',
    type: 'list',
    message: '\n',
    choices: [
      'Return To Main Menu',
      'Exit',
    ],
    filter(val: string) {
      return val.toLowerCase();
    },
  }).then(async (result: object) => {
    if (result['exit_choice'] == 'return to main menu') { exit = false; }
  });
  
  return exit;
}
