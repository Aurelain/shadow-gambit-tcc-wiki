import fs from 'fs';
import fsExtra from 'fs-extra';
import attemptSelfRun from '../utils/attemptSelfRun.js';
import {API_LIMIT, DEBUG, ENDPOINT, REPLACEMENTS, WIKI_DIR} from '../CONFIG.js';
import requestMultiple from './requestMultiple.js';
import {strict as assert} from 'assert';
import storeWikiMetadata from '../shared/storeWikiMetadata.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const download = async () => {
    try {
        const normalPages = await requestMultiple(getPages, '0');
        writePages(normalPages);
        storeWikiMetadata(normalPages);
    } catch (e) {
        console.log('Error:', e.message);
        DEBUG && console.log(e.stack);
    }
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 * Sample: https://shadowgambit.fandom.com/api.php?action=query&format=json&prop=revisions&rvprop=content&rvslots=main&generator=allpages&gapnamespace=0&gaplimit=50
 * {
 *      pages: {
 *           'Category/Foo_Bar!%2Fdoc.wiki': {
 *                title: 'Category:Foo Bar!/doc',
 *                content: 'hello',
 *           },
 *           ...
 *      },
 *      continuation: 'My Next Page',
 * }
 */
const getPages = async (namespaces, continuation) => {
    console.log('Getting pages... ' + (continuation ? `(${continuation})` : ''));
    const searchParams = {
        action: 'query',
        format: 'json',
        prop: 'revisions',
        rvprop: 'content|ids',
        rvslots: 'main',
        generator: 'allpages',
        gapnamespace: namespaces,
        gaplimit: API_LIMIT,
    };
    if (continuation) {
        searchParams.gapcontinue = continuation;
    }
    const url = ENDPOINT + '?' + new URLSearchParams(searchParams);
    const result = await fetch(url);
    const body = await result.json();
    return {
        pages: parsePages(body),
        continuationObject: body?.continue,
    };
};

/**
 *
 */
const parsePages = (body) => {
    const pages = body?.query?.pages;
    assert(pages || body?.batchcomplete === '', 'Unexpected collection of texts!');
    const bag = {};
    for (const key in pages) {
        const {title, revisions} = pages[key];
        const content = revisions?.[0].slots?.main?.['*'];
        assert(content, `Invalid revision content for\n${JSON.stringify(pages[key], null, 4)}`);
        const revid = revisions?.[0].revid;
        assert(revid >= 0, `Invalid revision id for\n${JSON.stringify(pages[key], null, 4)}`);
        const filePath = getFilePath(title, content);
        bag[filePath] = {title, content, revid};
    }
    return bag;
};

/**
 * Converts a wiki title into a filesystem name, including a custom extension.
 */
const getFilePath = (title, content) => {
    const ext = typeof content === 'string' ? 'wiki' : 'json';
    const dir = (title.match(/^([^:]+):[^ _]/) || [null, ''])[1]; // Watch-out for "Weakness: Blind Spot"
    const prefix = dir ? dir + '/' : '';
    let name = dir ? title.substring(dir.length + 1) : title;
    for (const c in REPLACEMENTS) {
        name = name.split(c).join(REPLACEMENTS[c]);
    }
    return prefix + name + '.' + ext;
};

/**
 *
 */
const writePages = (pages) => {
    fsExtra.emptyDirSync(WIKI_DIR);
    for (const filePath in pages) {
        const {content} = pages[filePath];
        const fullFilePath = WIKI_DIR + '/' + filePath;
        const fullFileDir = fullFilePath.replace(/[^/]*$/, '');
        fsExtra.ensureDirSync(fullFileDir);
        const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 4);
        fs.writeFileSync(fullFilePath, fileContent);
    }
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
attemptSelfRun(download);
export default download;
