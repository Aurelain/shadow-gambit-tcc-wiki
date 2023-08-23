/**
 *
 */
const generateWikiTable = (rows, styles = []) => {
    const safeRows = [];
    for (const row of rows) {
        safeRows.push(Object.values(row));
    }
    let draft = '';
    draft += '{| class="wikitable sortable"\n';
    draft += '!' + safeRows[0].join('!!') + '\n';
    for (let i = 1; i < safeRows.length; i++) {
        const style = styles[i] ? `style="${styles[i]}"` : '';
        draft += '|-' + style + '\n';
        draft += '|' + safeRows[i].join('||') + '\n\n';
    }
    draft += '|}';
    return draft;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default generateWikiTable;
