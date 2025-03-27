import { HOUSING_DATA_PATH } from './config.js';
import { formatHouse } from './displayHousing.js';
import { createReadStream } from 'fs';
import { parse } from 'ndjson';

// pure function to validate price input
const validatePrice = (price) => {
    const parsedPrice = Number(price);
    return !isNaN(parsedPrice) && parsedPrice >= 0;
};

// pure function to create price range filter
const createPriceRangeFilter = (minPrice, maxPrice) => (house) => {
    const price = parseInt(house.price);
    return price >= minPrice && price <= maxPrice;
};

// higher-order function to filter houses
const filterHouses = (predicate) => (houses) => 
    houses.filter(predicate);

// pure function to read and filter housing data
const readAndFilterHouses = async (minPrice, maxPrice) => {
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
                const priceFilter = createPriceRangeFilter(minPrice, maxPrice);
                const filter = filterHouses(priceFilter);
                const filteredHouses = filter(houses);
                resolve(filteredHouses);
            });
    });
};

const searchByPrice = async (minPrice, maxPrice) => {
    try {
        if (!validatePrice(minPrice) || !validatePrice(maxPrice)) {
            throw new Error('Invalid price range. Please enter valid numbers.');
        }

        // making sure minPrice is less than maxPrice
        const min = Math.min(Number(minPrice), Number(maxPrice));
        const max = Math.max(Number(minPrice), Number(maxPrice));

        const filteredHouses = await readAndFilterHouses(min, max);
        
        if (filteredHouses.length === 0) {
            console.log('\nNo houses found in this price range.');
            return [];
        }

        const formattedHouses = filteredHouses.map(formatHouse);
        console.log(`\nFound ${filteredHouses.length} houses in price range $${min.toLocaleString()} - $${max.toLocaleString()}:`);
        console.table(formattedHouses);
        
        return formattedHouses;
    } catch (error) {
        console.error('Error searching houses:', error.message);
        return [];
    }
};

export {
    searchByPrice,
    validatePrice,
    createPriceRangeFilter,
    filterHouses
};