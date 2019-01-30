import fs from 'fs';
import flatten from '@flatten/array';
import parse from 'csv-parse/lib/sync';

export default function getRecordsID(dataFile) {
    let file = fs.readFileSync(dataFile, 'utf8');
    
    let wosIDs = parse(file, {
        skip_empty_lines: true
    });
    
    return flatten(wosIDs);
}
