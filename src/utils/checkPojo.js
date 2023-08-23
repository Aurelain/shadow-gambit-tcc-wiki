/**
 *
 */
const checkPojo = (target) => Boolean(target && typeof target === 'object' && !Array.isArray(target));

export default checkPojo;
