import {CREW_AFIA, CREW_GAELLE, CREW_JOHN, CREW_PINKUS, CREW_QUENTIN, CREW_TERESA, CREW_TOYA} from './BADGES.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const REDIRECT = {
    [CREW_AFIA]: 'Afia_Manicato',
    [CREW_PINKUS]: 'Pinkus_von_Presswald',
    [CREW_TERESA]: 'Teresa_la_Ciega',
    [CREW_TOYA]: 'Toya_of_Iga',
    [CREW_QUENTIN]: 'Quentin_Aalbers',
    [CREW_GAELLE]: 'Gaëlle_le_Bris',
    [CREW_JOHN]: 'John_Hughes_Mercury',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const linkPage = (displayName) => {
    const actualPageAddress = REDIRECT[displayName] ? REDIRECT[displayName] + '|' : '';
    return `[[${actualPageAddress}${displayName}]]`;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default linkPage;
