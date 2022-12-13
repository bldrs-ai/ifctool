import {Exception} from './utils.js'
import * as Strings from './strings.js'


/**
 * String array to integer array.
 *
 * @param {Array<string>} strArr
 * @return {Array<number>}
 */
export function stoi(strArr) {
  const eltIds = strArr.map((str) => Strings.stoi(str))
  const nanNdx = eltIds.findIndex(Number.isNaN)
  if (nanNdx !== -1) {
    throw new Exception(`Invalid ID: ${strArr[nanNdx]}`)
  }
  return eltIds
}


/**
 * True iff the two arrays have the same elements in the same order
 *
 * @param {Array} arr1
 * @param {Array} arr2
 * @return {boolean}
 */
export function equals(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[2]) {
      return false
    }
  }
  return true
}
