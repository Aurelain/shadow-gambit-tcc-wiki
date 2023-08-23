/**
 * Checks if an object (Pojo, Array or any other kind of real object) lacks keys.
 * As a side effect, falsy values are considered empty.
 *
 * We prefer this function to lodash's `isEmpty` because it should be faster and the IDE detects it better.
 * https://github.com/lodash/lodash/blob/ddfd9b11a0126db2302cb70ec9973b66baec0975/lodash.js#L11479
 */
const isEmpty = (target) => {
    return !target || Object.keys(target).length === 0;
};

export default isEmpty;
