import {REPLACEMENTS} from '../CONFIG.js';

/**
 *
 */
const convertFileNameToTitle = (fileName) => {
    let title = fileName;
    for (const unsafe in REPLACEMENTS) {
        const safe = REPLACEMENTS[unsafe];
        title = title.split(safe).join(unsafe);
    }
    return title;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default convertFileNameToTitle;
