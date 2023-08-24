import attemptSelfRun from '../utils/attemptSelfRun.js';
import {DEBUG, OUTPUT_DIR} from '../CONFIG.js';
import fs from 'fs';
import open from 'open';
import readYamlFileAsJson from '../utils/readYamlFileAsJson.js';
import assert from 'assert/strict';
import isNumber from '../utils/isNumber.js';
import findFiles from '../utils/findFiles.js';
import isEmpty from '../utils/isEmpty.js';
import sortJson from '../utils/sortJson.js';
import {BADGES} from './BADGES.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const NAMES_PATH = 'input/game/ExportedProject/Assets/Loca/Badges/Badges_MiLocaNiceNamesAsset.asset';
const TEXTS_DIR = 'input/game/ExportedProject/Assets/Loca/Badges';
const TEXTS_FILE_PATTERN = /Badges_text_\w+\.txt$/;
const NAME_FIXES = {
    badge_mis_generic_10: 'badge_mis_generic_guns',
    badge_mis_generic_desc_10: 'badge_mis_generic_guns_desc',
};
const OUTPUT_PAGE = OUTPUT_DIR + '/Badges.wiki';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const suggest = async () => {
    try {
        suggestBadges();
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
const suggestBadges = () => {
    const badgesRepository = readBadgesRepository();
    const badgesList = compactBadgesRepository(badgesRepository);

    const languagePaths = findFiles(TEXTS_DIR, TEXTS_FILE_PATTERN);
    assert(languagePaths.length > 1, 'Expecting many language files!');
    const i18n = readI18n(languagePaths);
    enrichByNid(badgesList, i18n);
    console.log('badgesList:', badgesList.length);

    validateBadges(badgesList, BADGES);

    fs.writeFileSync(OUTPUT_PAGE, JSON.stringify(sortJson(badgesList), null, 4));
    open(OUTPUT_PAGE);
};

/**
 *
 */
const readBadgesRepository = () => {
    const json = readYamlFileAsJson(NAMES_PATH);
    const repository = json.m_arMapping;
    assert(Array.isArray(repository), `Expecting the "m_arMapping" prop in "${NAMES_PATH}"!`);
    for (const item of repository) {
        const {m_iUniqueID, m_strNiceName} = item;
        assert(isNumber(m_iUniqueID), `Expecting numeric id in "${JSON.stringify(item)}"!`);
        assert(m_strNiceName, `Expecting nice name in "${JSON.stringify(item)}"!`);
    }
    return repository;
};

/**
 * Moves some badges from the root of the repository to the kids property of some other badges.
 */
const compactBadgesRepository = (badgesRepository) => {
    const output = [];

    for (const {m_iUniqueID: nid, m_strNiceName} of badgesRepository) {
        const name = NAME_FIXES[m_strNiceName] || m_strNiceName;
        const badge = {
            name,
            nid,
            kids: [],
        };
        output.push(badge);
    }

    for (let i = 0; i < output.length; i++) {
        const badge = output[i];
        let cleanName = badge.name.replace(/_desc_/, '_');
        cleanName = cleanName.replace(/_desc$/, '');
        cleanName = cleanName.replace(/_\d+$/, '');
        cleanName = cleanName.replace(/_devs_.*/, '_devs');
        for (let j = 0; j < output.length; j++) {
            if (i === j) {
                // This is us
                continue;
            }
            const potentialParent = output[j];
            // if (potentialParent.name === cleanName || cleanName.startsWith(potentialParent.name)) {
            if (potentialParent.name === cleanName) {
                // We are the kid of somebody else
                assert(isEmpty(badge.kids), 'We are about to move a badge that already has kids!');
                potentialParent.kids.push(badge); // register inside the parent
                delete badge.kids; // we can't have kids ourselves
                output.splice(i, 1); // remove ourselves from the output
                i--; // don't advance, because we removed ourselves
                break;
            }
        }
    }

    for (const badge of output) {
        assert(badge.kids.length, `No kids! ${JSON.stringify(badge)}`);
    }

    return output;
};

/**
 *
 */
const readI18n = (languagePaths) => {
    const i18n = {};
    for (const filePath of languagePaths) {
        const key = filePath.match(/([A-Za-z]+)\.txt$/)[1];
        i18n[key] = readTextMapping(filePath, key);
    }
    return i18n;
};

/**
 *
 */
const readTextMapping = (textsFilePath, locator) => {
    const output = {};
    let draft = fs.readFileSync(textsFilePath, 'utf8');
    draft = draft.trim();
    draft = draft.replace(/[\r\n]+/g, '\n');
    const lines = draft.split('\n');
    assert(lines.length > 1, 'Insufficient lines!');
    for (const line of lines) {
        const match = line.match(/^(\d+)\t(.*)/);
        assert(match, `Unexpected format in line "${line}"!`);
        let [, nid, text] = match;
        text = text.replace(/\s+/, ' ').trim();
        if (!text) {
            // TODO: find out what people actually see when using those languages
            // console.log(`Text is empty in line "${line}" @ "${locator}"!`);
        }
        output[nid] = text;
    }
    return output;
};

/**
 *
 */
const enrichByNid = (target, i18n) => {
    const {nid} = target;
    if (nid) {
        const texts = {};
        for (const language in i18n) {
            const numbersToTexts = i18n[language];
            assert(nid in numbersToTexts, `Cannot find "${nid}" in "${language}"!`);
            texts[language] = numbersToTexts[nid];
        }
        // target.texts = texts;
        target._text = texts.English;
    }
    for (const key in target) {
        const item = target[key];
        if (item && typeof target[key] === 'object') {
            enrichByNid(item, i18n);
        }
    }
};

/**
 *
 */
const validateBadges = (badgesList, BADGES) => {
    const minedNames = {};
    for (const badge of badgesList) {
        minedNames[badge.name] = badge._text;
    }

    const hardcodedNames = {};
    for (const badge of BADGES) {
        hardcodedNames[badge.name] = true;
    }

    for (const minedName in minedNames) {
        if (!hardcodedNames[minedName]) {
            console.log(`Mined name "${minedName}" not found in hardcoded list!`);
        }
    }

    for (const hardcodedName in hardcodedNames) {
        if (!minedNames[hardcodedName]) {
            console.log(`Hardcoded name "${hardcodedName}" not found in mined list!`);
        }
    }

    let sumAll = 0;
    let sumLoc = 0;
    let sumMis = 0;
    let sumCrew = 0;
    let sumGen = 0;
    for (const badge of BADGES) {
        const {steps, loc, mis, crew} = badge;
        const actualSteps = steps ? steps : 1;
        sumAll += actualSteps;
        if (crew) {
            sumCrew += actualSteps;
        } else if (mis) {
            sumMis += actualSteps;
        } else if (loc) {
            sumLoc += actualSteps;
        } else {
            sumGen += actualSteps;
        }
    }
    console.log('sumAll:', sumAll);
    console.log('sumCrew:', sumCrew);
    console.log('sumLoc:', sumLoc);
    console.log('sumMis:', sumMis);
    console.log('sumGen:', sumGen);
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
attemptSelfRun(suggest);
export default suggest;
