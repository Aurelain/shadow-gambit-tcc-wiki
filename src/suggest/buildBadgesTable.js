import linkPage from '../shared/linkPage.js';
import {GENERIC_BADGES} from '../CONFIG.js';
import getBadgeTitle from './getBadgeTitle.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const WORD_LOCATION = 'Island';
const WORD_MISSION = 'Mission';
const WORD_CREW = 'Crew';
const VALID_STATUS = {
    badge_gen_enter_marley: '❌',
    badge_mis_generic_solo_ovt: '✔️❌',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const buildBadgesTable = (hardcodedList, englishBadges, nameCollisions) => {
    const output = [
        [
            // 'Name', // hidden
            'Nr.',
            'Type',
            'Name',
            'Description',
            'Steps',
            'Valid',
        ],
    ];

    for (let i = 0; i < hardcodedList.length; i++) {
        const badge = hardcodedList[i];
        const row = buildRow(badge, i + 1, englishBadges, nameCollisions);
        output.push(row);
    }

    return output;
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const buildRow = (badge, nr, englishBadges, nameCollisions) => {
    const {name, steps} = badge;

    const badgeTitle = getBadgeTitle(badge, englishBadges, nameCollisions);
    const title = name in GENERIC_BADGES ? badgeTitle : linkPage(badgeTitle);

    const {description} = englishBadges[name];
    const type = getType(badge);
    return {
        // name, // hidden
        nr,
        type,
        title,
        description,
        steps,
        valid: VALID_STATUS[name] || '',
    };
};

/**
 *
 */
const getType = (badge) => {
    const {loc, mis, crew} = badge;
    if (loc) {
        if (mis) {
            return `${WORD_MISSION}: ${linkPage(mis)} (${linkPage(loc)})`;
        } else {
            return `${WORD_LOCATION}: ${linkPage(loc)}`;
        }
    } else if (crew) {
        return `${WORD_CREW}: ${linkPage(crew)}`;
    } else {
        return 'General';
    }
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildBadgesTable;
