import { HOUSING_DATA_PATH } from './config.js';
import { formatCurrency, formatArea, formatBoolean } from './displayHousing.js';
import { createReadStream } from 'fs';
import { parse } from 'ndjson';

// Pure function to create a comparator for numeric values
const createNumericComparator = (key) => (a, b) => {
    const aValue = parseInt(a[key]);
    const bValue = parseInt(b[key]);
    return aValue - bValue;
};

// Pure function to validate sort criteria
const validateSortCriteria = (criteria) => {
    const validCriteria = ['price', 'parking', 'area', 'bedrooms', 'bathrooms'];
    return validCriteria.includes(criteria.toLowerCase());
};

// Higher-order function to sort houses by a given criteria
const sortHousesBy = (criteria) => (houses) => {
    const comparator = createNumericComparator(criteria);
    return [...houses].sort(comparator);
};

// Pure function to format a single house record (modified version)
const formatHouseForSort = (house) => ({
    Price: formatCurrency(parseInt(house.price)),
    Area: formatArea(parseInt(house.area)),
    'Bed/Bath': `${house.bedrooms}/${house.bathrooms}`,
    Stories: house.stories,
    'Main Road': formatBoolean(house.mainroad),
    'Guest Room': formatBoolean(house.guestroom),
    Basement: formatBoolean(house.basement),
    'Hot Water': formatBoolean(house.hotwaterheating),
    'Air Conditioning': formatBoolean(house.airconditioning),
    Parking: house.parking,
    'Preferred Area': formatBoolean(house.prefarea),
    'Furnishing Status': house.furnishingstatus.charAt(0).toUpperCase() + 
                        house.furnishingstatus.slice(1)
});

// Pure function to read and sort housing data
const readAndSortHouses = async (criteria) => {
    return new Promise((resolve, reject) => {
        const houses = [];

        createReadStream(HOUSING_DATA_PATH)
            .pipe(parse())
            .on('data', obj => {
                if (obj && typeof obj === 'object') {
                    houses.push(obj);
                }
            })
            .on('error', error => {
                console.error('Error reading file:', error);
                reject(error);
            })
            .on('end', () => {
                const sorter = sortHousesBy(criteria);
                const sortedHouses = sorter(houses);
                resolve(sortedHouses);
            });
    });
};

// Function to display the sorting menu
const displaySortMenu = (rl) => {
    console.log('\nSort by:');
    console.log('1. Price (low to high)');
    console.log('2. Parking spaces');
    console.log('3. Area (sq ft)');
    console.log('4. Number of bedrooms');
    console.log('5. Number of bathrooms');
    return new Promise((resolve) => {
        rl.question('\nEnter your choice (1-5): ', (choice) => {
            resolve(choice.trim());
        });
    });
};

// Pure function to map menu choice to criteria
const getCriteria = (choice) => {
    const criteriaMap = {
        '1': 'price',
        '2': 'parking',
        '3': 'area',
        '4': 'bedrooms',
        '5': 'bathrooms'
    };
    return criteriaMap[choice];
};

// Main function to handle sorting
const sortHousing = async (rl) => {  // Accept rl as parameter
    try {
        const choice = await displaySortMenu(rl);  // Pass rl to displaySortMenu
        const criteria = getCriteria(choice);

        if (!criteria) {
            console.log('\nInvalid choice! Please select a number between 1 and 5.');
            return null;
        }

        if (!validateSortCriteria(criteria)) {
            console.log('\nInvalid sorting criteria!');
            return null;
        }

        const sortedHouses = await readAndSortHouses(criteria);
        
        // Format and display the sorted houses
        const formattedHouses = sortedHouses.map(formatHouseForSort);
        console.log(`\nHouses sorted by ${criteria} (low to high):`);
        console.table(formattedHouses);
        
        return formattedHouses;
    } catch (error) {
        console.error('Error sorting houses:', error.message);
        return null;
    }
};

export {
    sortHousing,
    sortHousesBy,
    validateSortCriteria,
    createNumericComparator
};