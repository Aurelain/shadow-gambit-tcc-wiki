// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
import linkPage from './linkPage.js';

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
const buildBadgesTable = (minedList, hardcodedList) => {
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

    const minedListByName = {};
    for (const badge of minedList) {
        minedListByName[badge.name] = badge;
    }

    const nameCollisions = {};
    const usedNames = {};
    for (const {name} of hardcodedList) {
        if (usedNames[name]) {
            nameCollisions[name] = true;
        }
        usedNames[name] = true;
    }

    for (let i = 0; i < hardcodedList.length; i++) {
        const badge = hardcodedList[i];
        const row = buildRow(badge, i + 1, minedListByName, nameCollisions);
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
const buildRow = (badge, nr, minedListByName, nameCollisions) => {
    const {name, steps} = badge;
    const title = getTitle(badge, minedListByName, nameCollisions);
    const description = minedListByName[name].kids[0]._text;
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
const getTitle = (badge, minedListByName, nameCollisions) => {
    const {name, loc, mis, crew} = badge;
    let title = minedListByName[name]._text;
    if (name in nameCollisions) {
        const clarification = mis || loc || crew;
        title += ` (${clarification})`;
        title = title.replace(/\(Ch. (\d)\)/, '$1');
    }
    return linkPage(title);
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
