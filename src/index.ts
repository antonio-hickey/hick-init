import inquirer from 'inquirer';
import { needToDoMore, handleUseCase } from './ctx';

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
		    'Create New Backend',
		    'Create New Frontend (! UNIMPLEMENTED !)',
        'Create New Web Scraper (! UNIMPLEMENTED !)',
        'Create New CLI (! UNIMPLEMENTED !)',
			],
			filter(val: string) {
				// make use case choice lowercase to reduce 
				// confusion throughout codebase.
				return val.toLowerCase();
			},
		}).then(async (useCase: UseCase) => {
			// Map the use case to functionality
			await handleUseCase(useCase.desired_use);

      // Give myself option to exit or go back 
      // to main menu in case I need to do more.
      if (await needToDoMore()) { main() };
		});
}
