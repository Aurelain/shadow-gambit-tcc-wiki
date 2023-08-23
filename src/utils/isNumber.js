/**
 *
 */
const isNumber = (target) => {
    return typeof target === 'number' && target !== Infinity && target !== -Infinity && !isNaN(target);
};

export default isNumber;
