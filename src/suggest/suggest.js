import attemptSelfRun from '../utils/attemptSelfRun.js';
import {DEBUG} from '../CONFIG.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const suggest = async () => {
    try {
        console.log('suggest');
    } catch (e) {
        console.log('Error:', e.message);
        DEBUG && console.log(e.stack);
    }
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
attemptSelfRun(suggest);
export default suggest;