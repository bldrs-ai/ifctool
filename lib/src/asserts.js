/**
 * @param {object} obj
 * @return {object} The object that was passed in.
 * @throws {Error} If the object is not a string.
 */
export function isString(obj) {
  if (typeof obj === 'string') {
    return obj
  }
  throw new Error('Expected string')
}


/**
 * @param {object} obj
 * @return {object} The object that was passed in.
 * @throws {Error} If the object is not an array.
 */
export function isArray(obj) {
  if (Array.isArray(obj)) {
    return obj
  }
  throw new Error('Expected array')
}


/**
 * @param {object} obj
 * @return {object} The object that was passed in.
 * @throws {Error} If the object is not an object.
 */
export function isObject(obj) {
  isDefined(obj)
  if (Array.isArray(obj)) {
    throw new Error(`Expected object: ${obj}`)
  }
  return obj
}


/**
 * @param {object} obj
 * @return {object} The object that was passed in.
 * @throws {Error} If the object is not defined.
 */
export function isDefined(obj) {
  if (obj === undefined || obj === null) {
    throw new Error('Object undefined')
  }
  return obj
}
