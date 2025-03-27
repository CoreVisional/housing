import { HOUSING_DATA_PATH } from './config.js';
import { createReadStream, writeFileSync } from 'fs';
import { parse } from 'ndjson';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Pure function to convert boolean string to Prolog format
const formatBooleanForProlog = (value) => 
    value?.toLowerCase() === 'yes' ? 'true' : 'false';

// Pure function to format a house as a Prolog fact
const formatHouseFactProlog = (house, id) => {
    return `house(${id}, ${house.price}, ${house.area}, ${house.bedrooms}, ${house.bathrooms}, ` +
           `${house.stories}, ${formatBooleanForProlog(house.mainroad)}, ` +
           `${formatBooleanForProlog(house.guestroom)}, ${formatBooleanForProlog(house.basement)}, ` +
           `${formatBooleanForProlog(house.hotwaterheating)}, ${formatBooleanForProlog(house.airconditioning)}, ` +
           `${house.parking}, ${formatBooleanForProlog(house.prefarea)}, '${house.furnishingstatus}').`;
};

// Generate Prolog facts from housing data
const generatePrologFacts = async () => {
    return new Promise((resolve, reject) => {
        const houses = [];
        let prologCode = '% Housing Knowledge Base\n\n';

        // Predicate definition comment
        prologCode += '% house(ID, Price, Area, Bedrooms, Bathrooms, Stories, MainRoad, GuestRoom, \n';
        prologCode += '%       Basement, HotWater, AirConditioning, Parking, PrefArea, FurnishStatus).\n\n';

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
                // Generate house facts
                houses.forEach((house, index) => {
                    prologCode += formatHouseFactProlog(house, index + 1) + '\n';
                });

                // helper predicates
                prologCode += '\n% Helper predicates\n';
                prologCode += 'price_less_than(Price, Threshold) :- number(Price), number(Threshold), Price < Threshold.\n';
                prologCode += 'price_greater_than(Price, Threshold) :- number(Price), number(Threshold), Price > Threshold.\n\n';

                // query predicates
                prologCode += '% Query predicates\n';
                prologCode += 'affordable_house(ID, Price, Area, Bedrooms, Bathrooms, Stories, FurnishStatus) :-\n';
                prologCode += '    house(ID, Price, Area, Bedrooms, Bathrooms, Stories, _, _, _, _, _, _, _, FurnishStatus),\n';
                prologCode += '    price_less_than(Price, 1000000).\n\n';

                prologCode += 'luxury_house(ID, Price, Area, Bedrooms, Bathrooms, Stories, FurnishStatus) :-\n';
                prologCode += '    house(ID, Price, Area, Bedrooms, Bathrooms, Stories, _, _, _, _, _, _, _, FurnishStatus),\n';
                prologCode += '    price_greater_than(Price, 1000000).\n\n';

                prologCode += 'preferred_area_house(ID, Price, Area, Bedrooms, Bathrooms, Stories, FurnishStatus) :-\n';
                prologCode += '    house(ID, Price, Area, Bedrooms, Bathrooms, Stories, _, _, _, _, _, _, true, FurnishStatus).\n';

                const prologFilePath = join(__dirname, 'prolog', 'housing.pl');
                writeFileSync(prologFilePath, prologCode);
                
                console.log('Successfully generated Prolog facts!');
                resolve();
            });
    });
};

export { generatePrologFacts };