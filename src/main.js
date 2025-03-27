import readline from 'readline';
import { displayHousing } from './displayHousing.js';
import { searchByPrice } from './searchByPrice.js';
import { countFurnished } from './countFurnished.js';
import { sortHousing } from './sortHousing.js';
import { displayHousesWithMarkup } from './applyMarkup.js';
import { generatePrologFacts } from './generatePrologFacts.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const clearConsole = () => {
    console.clear();
};

const displayMenu = () => {
    clearConsole();
    console.log('\n=== Housing Information System ===');
    console.log('1. Display all housing information');
    console.log('2. Search houses by price range');
    console.log('3. Count furnished houses');
    console.log('4. Sort housing information');
    console.log('5. Apply 10% markup to prices');
    console.log('6. Generate Prolog Knowledge Base');
    console.log('7. Exit');
    console.log('================================');
};

const continuePrompt = () => {
    return new Promise((resolve) => {
        rl.question('\nPress Enter to continue...', () => {
            resolve();
        });
    });
};

const main = async () => {
    while (true) {
        displayMenu();
        
        const answer = await new Promise((resolve) => {
            rl.question('\nPlease select an option (1-7): ', (input) => {
                resolve(input.trim());
            });
        });

        switch (answer) {
            case '1':
                clearConsole();
                console.log('\n=== Displaying All Housing Information ===\n');
                await displayHousing();
                await continuePrompt();
                break;

            case '2':
                clearConsole();
                console.log('\n=== Search Houses by Price Range ===\n');
                const minPrice = await new Promise((resolve) => {
                    rl.question('Enter minimum price: ', resolve);
                });
                const maxPrice = await new Promise((resolve) => {
                    rl.question('Enter maximum price: ', resolve);
                });
                await searchByPrice(minPrice, maxPrice);
                await continuePrompt();
                break;

            case '3':
                clearConsole();
                console.log('\n=== Furnished Houses Count ===\n');
                await countFurnished();
                await continuePrompt();
                break;

            case '4':
                clearConsole();
                console.log('\n=== Sort Housing Information ===');
                await sortHousing(rl);
                await continuePrompt();
                break;

            case '5':
                clearConsole();
                console.log('\n=== Housing Prices with 10% Markup ===\n');
                await displayHousesWithMarkup();
                await continuePrompt();
                break;

            case '6':
                clearConsole();
                console.log('\n=== Generating Prolog Knowledge Base ===\n');
                await generatePrologFacts();
                await continuePrompt();
                break;

            case '7':
                clearConsole();
                console.log('\nThank you for using Housing Information System!');
                rl.close();
                return;

            default:
                clearConsole();
                console.log('\nInvalid option! Please select a number between 1 and 7.');
                await continuePrompt();
        }
    }
};

rl.on('close', () => {
    process.exit(0);
});

console.log('Starting Housing Information System...');
main().catch(error => {
    console.error('An error occurred:', error);
    rl.close();
});