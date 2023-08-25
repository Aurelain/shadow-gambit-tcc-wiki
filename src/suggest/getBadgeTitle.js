/**
 *
 */
const getBadgeTitle = (badge, englishBadges, nameCollisions) => {
    const {name, loc, mis, crew} = badge;
    let title = englishBadges[name].title;
    if (name in nameCollisions) {
        const clarification = mis || loc || crew;
        title += ` (${clarification})`;
        title = title.replace(/\(Ch. (\d)\)/, '$1');
    }
    return title;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default getBadgeTitle;
