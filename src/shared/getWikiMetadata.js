import fs from 'fs';
import {WIKI_METADATA_FILE} from '../CONFIG.js';
import checkPojo from '../utils/checkPojo.js';
import assume from '../utils/assume.js';

/**
 *
 */
const getWikiMetadata = () => {
    let wikiMetadata;
    try {
        wikiMetadata = JSON.parse(fs.readFileSync(WIKI_METADATA_FILE, 'utf8'));
        assume(checkPojo(wikiMetadata.pages), 'Unexpected wiki-metadata format!');
    } catch (e) {
        wikiMetadata = {
            pages: {},
        };
    }
    return wikiMetadata;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default getWikiMetadata;
