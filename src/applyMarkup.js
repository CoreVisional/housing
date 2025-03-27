// applyMarkup.js
import { HOUSING_DATA_PATH } from './config.js';
import { createReadStream } from 'fs';
import { parse } from 'ndjson';
import { formatCurrency } from './displayHousing.js';

// Pure function to calculate markup
const calculateMarkup = (percentage) => (price) => {
    const numericPrice = parseInt(price);
    const markup = numericPrice * (percentage / 100);
    return numericPrice + markup;
};

// Pure function to apply markup to a house
const applyMarkupToHouse = (markupFn) => (house) => ({
    ...house,
    originalPrice: house.price,
    price: Math.round(markupFn(house.price)).toString()
});

// Higher-order function to map over houses and apply markup
const applyMarkupToHouses = (markupPercentage) => (houses) => {
    const markup = calculateMarkup(markupPercentage);
    return houses.map(applyMarkupToHouse(markup));
};

// Pure function to format house for display
const formatHouseWithMarkup = (house) => ({
    'Original Price': formatCurrency(parseInt(house.originalPrice)),
    'Price with Markup': formatCurrency(parseInt(house.price)),
    'Difference': formatCurrency(parseInt(house.price) - parseInt(house.originalPrice)),
    Area: `${parseInt(house.area).toLocaleString()} sq ft`,
    'Bed/Bath': `${house.bedrooms}/${house.bathrooms}`,
    'Furnishing Status': house.furnishingstatus.charAt(0).toUpperCase() + 
                        house.furnishingstatus.slice(1)
});

// Function to read and process housing data
const readAndApplyMarkup = () => {
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
                // Apply 10% markup using function composition
                const applyTenPercentMarkup = applyMarkupToHouses(10);
                const housesWithMarkup = applyTenPercentMarkup(houses);
                resolve(housesWithMarkup);
            });
    });
};

const displayHousesWithMarkup = async () => {
    try {
        const housesWithMarkup = await readAndApplyMarkup();
        const formattedHouses = housesWithMarkup.map(formatHouseWithMarkup);
        
        console.log('\nHousing Prices with 10% Markup:');
        console.log('--------------------------------');
        console.table(formattedHouses);

        const totalMarkup = housesWithMarkup.reduce((acc, house) => 
            acc + (parseInt(house.price) - parseInt(house.originalPrice)), 0);
        
        console.log('\nSummary:');
        console.log('--------');
        console.log(`Total Houses: ${housesWithMarkup.length}`);
        console.log(`Total Markup: ${formatCurrency(totalMarkup)}`);
        
        return formattedHouses;
    } catch (error) {
        console.error('Error applying markup:', error);
        return null;
    }
};

export {
    displayHousesWithMarkup,
    calculateMarkup,
    applyMarkupToHouse,
    applyMarkupToHouses
};