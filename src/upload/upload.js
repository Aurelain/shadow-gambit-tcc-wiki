import fs from 'fs';
import got from 'got';
import FormData from 'form-data';
import {CookieJar} from 'tough-cookie';
import inquirer from 'inquirer';

import attemptSelfRun from '../utils/attemptSelfRun.js';
import sleep from '../utils/sleep.js';
import tally from '../utils/tally.js';
import computeSha1 from '../utils/computeSha1.js';
import convertFileNameToTitle from '../utils/convertFileNameToTitle.js';
import {ENDPOINT, CREDENTIALS_FILE, DEBUG, OUTPUT_DIR} from '../CONFIG.js';
import assume from '../utils/assume.js';
import findFiles from '../utils/findFiles.js';
import getWikiMetadata from '../shared/getWikiMetadata.js';
import storeWikiMetadata from '../shared/storeWikiMetadata.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const cookieJar = new CookieJar();
const ENUMERATE_SOME = 20;

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const upload = async (filter = '') => {
    try {
        const regExpFilter = filter ? new RegExp(filter) : /\.wiki$/;
        console.log('regExpFilter:', regExpFilter);
        const wikiMetadata = getWikiMetadata();
        const candidatePages = getCandidates(regExpFilter, wikiMetadata);
        if (!tally(candidatePages)) {
            console.log('Nothing to upload.');
            return;
        }
        if (!(await askPermission(candidatePages))) {
            return;
        }

        const credentials = await getCredentials();

        const token = await getCsrfToken(credentials);
        const botPasswords = ENDPOINT.replace(/[^/]*$/, 'wiki/Special:BotPasswords');
        assume(token?.length > 2, `Could not log in!\nVisit "${botPasswords}".`);

        await writePagesToCloud(candidatePages, token, wikiMetadata);

        console.log('Upload finished.');
    } catch (e) {
        console.log('Error:', e.message);
        DEBUG && console.log(e.stack);
    }
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const getCandidates = (regExpFilter, wikiMetadata) => {
    const candidates = {};
    const filePaths = findFiles(OUTPUT_DIR, regExpFilter);
    const {pages} = wikiMetadata;
    for (const filePath of filePaths) {
        const name = filePath.split('/').pop();
        const content = fs.readFileSync(filePath, 'utf8');
        if (!pages[name]) {
            // This is a new file that doesn't exist online.
            candidates[name] = {
                content,
            };
        } else {
            const currentSha1 = computeSha1(content);
            const {sha1, revid} = pages[name];
            if (currentSha1 !== sha1) {
                candidates[name] = {
                    content,
                    revid,
                };
            }
        }
    }
    return candidates;
};

/**
 *
 */
const askPermission = async (changedPages) => {
    console.log(`You are about to write the following pages to the cloud (${tally(changedPages)}):`);
    enumerateSome(changedPages);
    const response = await inquirer.prompt({
        type: 'confirm',
        name: 'continue',
        message: 'Do you want to continue?',
        default: true,
    });
    return response.continue;
};

/**
 *
 */
const enumerateSome = (target) => {
    let i = 0;
    for (const key in target) {
        i++;
        if (i > ENUMERATE_SOME) {
            break;
        }
        console.log('    ' + key);
    }
    if (tally(target) > ENUMERATE_SOME) {
        console.log('    ...');
    }
};

/**
 *
 */
const writePagesToCloud = async (candidatePages, token) => {
    const withSleep = tally(candidatePages) > 1;
    for (const name in candidatePages) {
        const {content, revid} = candidatePages[name];
        const title = convertFileNameToTitle(name).replace(/\.[^.]*$/, '');
        let freshMetaEntry;
        if (title.match(/^File\b/)) {
            freshMetaEntry = await uploadImage(title, name, token);
        } else {
            freshMetaEntry = await writeText(title, content, token, revid);
        }
        if (freshMetaEntry) {
            storeWikiMetadata({[name]: freshMetaEntry});
        }
        withSleep && (await sleep(1000));
    }
};

/**
 *
 */
const getCredentials = () => {
    let credentials;
    try {
        credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    } catch (e) {}
    assume(credentials, 'Credentials are falsy!');
    assume(credentials.username && typeof credentials.username === 'string', 'Username is falsy!');
    assume(credentials.password && typeof credentials.password === 'string', 'Password is falsy!');
    return credentials;
};

/**
 * We prefer not to use the `mediawiki` package as audit says it has several vulnerabilities... and it doesn't work.
 * Adapted from code examples at https://www.mediawiki.org/wiki/API:Edit
 */
const getCsrfToken = async ({username, password}) => {
    // Step 1: GET request to fetch login token
    const loginTokenResponse = await got(ENDPOINT, {
        method: 'get',
        searchParams: {
            action: 'query',
            format: 'json',
            meta: 'tokens',
            type: 'login',
        },
        responseType: 'json',
        cookieJar,
    });
    const {logintoken} = loginTokenResponse.body.query.tokens;

    // Step 2: POST request to log in.
    await got(ENDPOINT, {
        method: 'post',
        searchParams: {
            action: 'login',
            format: 'json',
            lgname: username,
        },
        body: formalize({
            lgpassword: password,
            lgtoken: logintoken,
        }),
        responseType: 'json',
        cookieJar,
    });

    // Step 3: GET request to fetch CSRF token
    const response = await got(ENDPOINT, {
        method: 'get',
        searchParams: {
            action: 'query',
            format: 'json',
            meta: 'tokens',
        },
        responseType: 'json',
        cookieJar,
    });
    const {csrftoken} = response.body.query.tokens;
    return csrftoken;
};

/**
 *
 */
const writeText = async (title, text, token, revid) => {
    console.log(`Writing text page "${title}"...`);
    const {body} = await got(ENDPOINT, {
        method: 'post',
        searchParams: {
            action: 'edit',
            format: 'json',
        },
        body: formalize({
            title,
            text,
            token,
            baserevid: revid,
        }),
        responseType: 'json',
        cookieJar,
    });
    assume(body?.edit?.result === 'Success', 'Could not write text!\n' + JSON.stringify(body, null, 4));
    const newrevid = body.edit.newrevid;
    return {
        content: text,
        revid: newrevid,
    };
};

/**
 *
 */
const uploadImage = async (title, filePath, token) => {
    assume(false, 'Not yet supported');
    const rawPath = 'RAW_WEB' + '/' + filePath.replace(/^File./, '').replace(/\.[^.]*$/, '');
    assume(fs.existsSync(rawPath), `Raw file "${rawPath}" not found!`);
    const safeFileName = title.replace(/^File./, '');
    console.log(`Uploading "${safeFileName}"...`);
    const {body} = await got(ENDPOINT, {
        method: 'post',
        searchParams: {
            action: 'upload',
            format: 'json',
            ignorewarnings: true, // to allow duplicates
        },
        body: formalize({
            filename: safeFileName,
            file: fs.createReadStream(rawPath),
            token,
        }),
        responseType: 'json',
        cookieJar,
    });
    // console.log('body: ' + JSON.stringify(body, null, 4));
    assume(body?.upload?.result === 'Success', 'Could not upload file!\n' + JSON.stringify(body, null, 4));
    return null; // TODO: write the revid and the new file content!
};

/**
 *
 */
const formalize = (bag) => {
    const form = new FormData();
    for (const key in bag) {
        if (bag[key] !== undefined) {
            form.append(key, bag[key]);
        }
    }
    return form;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
attemptSelfRun(upload);
export default upload;
