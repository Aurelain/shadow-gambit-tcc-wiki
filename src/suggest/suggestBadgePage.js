import linkPage from '../shared/linkPage.js';
import {OUTPUT_DIR, WIKI_DIR} from '../CONFIG.js';
import convertTitleToFileName from '../utils/convertTitleToFileName.js';
import fs from 'fs';
import assert from 'assert/strict';
import getBadgeTitle from './getBadgeTitle.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const suggestBadgePage = (badge, englishBadges, nameCollisions) => {
    const title = getBadgeTitle(badge, englishBadges, nameCollisions);
    const fileName = convertTitleToFileName(title);

    let draft = buildHeader(badge, englishBadges) + '\n\n';

    const sourcePath = WIKI_DIR + '/' + fileName;
    const exitingContent = fs.existsSync(sourcePath) && fs.readFileSync(sourcePath, 'utf8');
    if (exitingContent) {
        const walkthroughIndex = exitingContent.indexOf('{| class="mw-collapsible');
        assert(walkthroughIndex > -1, `Could not find the walkthrough in ${sourcePath}!`);
        draft += exitingContent.substring(walkthroughIndex);
    } else {
        draft += buildGenericWalkthrough();
    }

    const destinationPath = OUTPUT_DIR + '/' + fileName;
    fs.writeFileSync(destinationPath, draft);
    // open(destinationPath);
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const buildHeader = (badge, englishBadges) => {
    const {name, crew, loc, mis} = badge;
    const {title, description} = englishBadges[name];

    let suffix;
    if (badge.crew) {
        suffix = `with crew member ${linkPage(crew)}`;
    } else if (badge.mis) {
        suffix = `the mission ${linkPage(mis)} on the island of ${linkPage(loc)}`;
    } else if (badge.loc) {
        suffix = `on the island of ${linkPage(loc)}`;
    }

    let intro;
    if (suffix) {
        intro = `'''${title}''' is a [[Badges|badge]] that can be obtained by playing ${suffix}.`;
    } else {
        intro = `'''${title}''' is a general [[Badges|badge]].`;
    }

    return `
${intro}

Objective: <big style="color:yellow">${description}</big>
    `.trim();
};

/**
 *
 */
const buildGenericWalkthrough = () => {
    return `
{| class="mw-collapsible mw-collapsed"
|+ style=white-space:nowrap;text-align:left | <big style="color:yellow">💡 Walkthrough</big>
|-
| Please contribute...
|}
    `.trim();
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default suggestBadgePage;
