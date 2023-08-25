import {REPLACEMENTS} from '../CONFIG.js';

/**
 * Converts a wiki title into a filesystem name, including a custom extension.
 */
const convertTitleToFileName = (title) => {
    let name = title;
    for (const c in REPLACEMENTS) {
        name = name.split(c).join(REPLACEMENTS[c]);
    }
    return name + '.wiki';
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default convertTitleToFileName;
