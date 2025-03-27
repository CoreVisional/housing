import { HOUSING_DATA_PATH } from './config.js';
import { createReadStream } from 'fs';
import { parse } from 'ndjson';

// pure function to format currency
const formatCurrency = (price) => 
    new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);

// pure function to format area with commas and sq ft
const formatArea = (area) => 
    `${new Intl.NumberFormat('en-US').format(area)} sq ft`;

// pure function to format boolean values
const formatBoolean = (value) => 
    value?.toLowerCase() === 'yes' ? '✓' : '✗';

// pure function to format a single house record
const formatHouse = (house, index) => {
    if (!house || typeof house !== 'object') {
        console.warn('Invalid house object received:', house);
        return null;
    }

    const numberKey = `${index + 1}`;
    
    return {
        [numberKey]: {
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
        }
    };
};

// higher-order function to display houses in a specific format
const displayHouses = (formatter) => (houses) => 
    houses.reduce((acc, house, index) => {
        const formattedHouse = formatter(house, index);
        return { ...acc, ...formattedHouse };
    }, {});

// read and parse the JSON file using ndjson
const readHousingData = () => {
    return new Promise((resolve, reject) => {
        const houses = [];

        createReadStream(HOUSING_DATA_PATH)
            .pipe(parse())
            .on('data', obj => {
                // vlidate the object before pushing
                if (obj && typeof obj === 'object') {
                    houses.push(obj);
                } else {
                    console.warn('Invalid house object:', obj);
                }
            })
            .on('error', error => {
                console.error('Error reading file:', error);
                reject(error);
            })
            .on('end', () => {
                console.log(`There are currently ${houses.length} houses listed.`);
                resolve(houses);
            });
    });
};

// display housing information
const displayHousing = async () => {
    try {
        const houses = await readHousingData();
        const display = displayHouses(formatHouse);
        const formattedHouses = display(houses);

        console.table(formattedHouses);
        return formattedHouses;
    } catch (error) {
        console.error('Error displaying housing data:', error);
        return [];
    }
};

export {
    displayHousing,
    formatHouse,
    formatCurrency,
    formatArea,
    formatBoolean
};