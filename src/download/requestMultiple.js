import assert from 'assert/strict';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
/**
 * Prevents infinite loops.
 * This controls how many times we can request results (using API_LIMIT = 50) before we decide this is an endless loop.
 * Practically, we have an upper limit of 5000 results for each namespace.
 */
const LOOP_LIMIT = 100;

/**
 *
 */
const DENIED_PAGES = {};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 * {
 *      'Category/Foo_Bar!%2Fdoc.wikitext': {
 *          title: 'Category:Foo Bar!/doc',
 *          content: 'hello',
 *      },
 *      ...
 * }
 */
const requestMultiple = async (requestFunction, namespaces) => {
    let continuation = '';
    const output = {};
    const lowercaseBag = {};
    let i = 0;
    while (true) {
        i++;
        const result = await requestFunction(namespaces, continuation);
        assignWithCare(output, lowercaseBag, result.pages);
        continuation = chooseContinuation(result.continuationObject);
        if (i >= LOOP_LIMIT) {
            console.log('Loop limit reached!');
            break;
        }
        if (!continuation) {
            // Finished
            break;
        }
    }
    return output;
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const assignWithCare = (destination, lowercaseBag, fresh) => {
    for (const id in fresh) {
        if (id in DENIED_PAGES) {
            continue;
        }
        if (id in destination) {
            continue;
        }
        if (fresh[id].content.includes('#REDIRECT')) {
            continue;
        }
        const lowercaseId = id.toLowerCase();
        assert(!lowercaseBag[lowercaseId], `Case-sensitivity issue: "${lowercaseBag[lowercaseId]}" vs "${id}"`);
        destination[id] = fresh[id];
        lowercaseBag[lowercaseId] = id;
    }
};

/**
 *
 */
const chooseContinuation = (continuationObject) => {
    if (continuationObject) {
        for (const key in continuationObject) {
            if (key.startsWith('g')) {
                // We assume this is a "grccontinue" or a "gapcontinue"
                return continuationObject[key];
            }
        }
    }
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default requestMultiple;
