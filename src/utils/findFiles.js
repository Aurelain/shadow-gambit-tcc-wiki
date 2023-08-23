import fs from 'fs';
import {join} from 'path';

/**
 * https://stackoverflow.com/a/16684530
 */
const findFiles = (dir, pattern, results = []) => {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const joinedPath = join(dir, file);
        const stat = fs.statSync(joinedPath);
        if (stat && stat.isDirectory()) {
            findFiles(joinedPath, pattern, results);
        } else {
            if (!pattern || joinedPath.match(pattern)) {
                results.push(joinedPath.split('\\').join('/'));
            }
        }
    }
    return results;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default findFiles;
