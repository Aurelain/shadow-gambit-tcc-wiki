import fs from 'fs';
import computeSha1 from '../utils/computeSha1.js';
import {WIKI_METADATA_FILE} from '../CONFIG.js';
import getWikiMetadata from './getWikiMetadata.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const storeWikiMetadata = (pages) => {
    const wikiMetadata = getWikiMetadata();
    for (const filePath in pages) {
        const {revid, content} = pages[filePath];
        wikiMetadata.pages[filePath] = {
            sha1: computeSha1(typeof content === 'string' ? content : JSON.stringify(content, null, 4)),
            revid,
        };
    }
    fs.writeFileSync(WIKI_METADATA_FILE, JSON.stringify(wikiMetadata, null, 4));
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default storeWikiMetadata;
