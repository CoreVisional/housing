import { HOUSING_DATA_PATH } from './config.js';
import { createReadStream } from 'fs';
import { parse } from 'ndjson';

// Pure function to match furnishing status
const matchFurnishingStatus = (status) => (house) => 
    house.furnishingstatus.toLowerCase() === status.toLowerCase();

// Pure function to count items matching a predicate
const countByPredicate = (predicate) => (houses) => 
    houses.filter(predicate).length;

// Higher-order function to get counts for multiple statuses
const getFurnishingCounts = (houses) => {
    const countByStatus = countByPredicate;
    
    return {
        furnished: countByStatus(matchFurnishingStatus('furnished'))(houses),
        semiFurnished: countByStatus(matchFurnishingStatus('semi-furnished'))(houses),
        unfurnished: countByStatus(matchFurnishingStatus('unfurnished'))(houses),
        total: houses.length
    };
};

// Pure function to format the counts as percentages
const calculatePercentages = (counts) => ({
    ...counts,
    percentages: {
        furnished: ((counts.furnished / counts.total) * 100).toFixed(1) + '%',
        semiFurnished: ((counts.semiFurnished / counts.total) * 100).toFixed(1) + '%',
        unfurnished: ((counts.unfurnished / counts.total) * 100).toFixed(1) + '%'
    }
});

// Pure function to format the output string
const formatCountOutput = (stats) => [
    '\nFurnishing Status Counts:',
    '------------------------',
    `Furnished: ${stats.furnished} (${stats.percentages.furnished})`,
    `Semi-Furnished: ${stats.semiFurnished} (${stats.percentages.semiFurnished})`,
    `Unfurnished: ${stats.unfurnished} (${stats.percentages.unfurnished})`,
    '------------------------',
    `Total Houses: ${stats.total}`,
].join('\n');

// Function to read and parse the JSON file
const readHousingData = () => {
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
            .on('end', () => resolve(houses));
    });
};

// Main function to display furnishing counts
const countFurnished = async () => {
    try {
        const houses = await readHousingData();
        
        // Function composition using point-free style
        const getFormattedStats = (houses) => 
            formatCountOutput(
                calculatePercentages(
                    getFurnishingCounts(houses)
                )
            );

        const output = getFormattedStats(houses);
        console.log(output);
        
        return output;
    } catch (error) {
        console.error('Error counting furnished houses:', error);
        return null;
    }
};

export {
    countFurnished,
    getFurnishingCounts,
    calculatePercentages,
    formatCountOutput
};