/**
 * @param {object} obj
 * @return {object} The object that was passed in.
 * @throws {Error} If the object is not a string.
 */
export function assertIsString(obj) {
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
export function assertIsArray(obj) {
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
export function assertIsObject(obj) {
  if (obj === undefined || obj === null || Array.isArray(obj)) {
    throw new Error(`Expected object: ${obj}`)
  }
  return obj
}


/**
 * @param {object} obj
 * @return {object} The object that was passed in.
 * @throws {Error} If the object is not defined.
 */
export function assertIsDefined(obj) {
  if (obj === undefined || obj === null) {
    throw new Error('Object undefined')
  }
  return obj
}
