import {parse} from 'json2csv'


/** Exceptions are runtime errors that should */
export class Exception extends Error {
  /** @param {string} msg */
  constructor(msg) {
    super(msg)
  }
}


export const internalError = (errOrMsg, logger, ...rest) => {
  if (errOrMsg instanceof Error) {
    logger.error('Error: ', errOrMsg.message)
  } else {
    logger.error(errOrMsg, ...rest)
  }
}


/**
 * @param {object} obj
 * @param {array} fieldParts
 * @return {boolean}
 */
export function fieldHasValue(obj, fieldParts) {
  if (fieldParts.length == 1) {
    const value = obj[fieldParts[0]]
    if (value === null || value === undefined) {
      return false
    }
    return true
  } else {
    const subFieldName = fieldParts[0]
    const subFieldValue = obj[subFieldName]
    if (subFieldValue === null || subFieldValue === undefined) {
      return false
    }
    return fieldHasValue(subFieldValue, fieldParts.slice(1))
  }
}


/**
 * @param {object} json
 * @param {boolean} omitEmptyFields
 * @param {object} formatOpts
 * @return {object|array} The CSV data. TODO(pablo): better type
 */
export function jsonToCsv(json, omitEmptyFields=false, formatOpts) {
  const formatFields = formatOpts ? JSON.parse(formatOpts) : null
  const transforms = [
    (item) => {
      if (omitEmptyFields) {
        if (item === null || item === undefined) {
          return null
        }
        if (formatFields) {
          if (!Array.isArray(formatFields)) {
            throw new Error('Format fields must be an array, got: ' + formatFields)
          }
          for (let i = 0; i < formatFields.length; i++) {
            const fieldParts = formatFields[i].split('.')
            if (!fieldHasValue(item, fieldParts)) {
              return null
            }
          }
        }
      }
      return item
    },
  ]
  if (formatFields) {
    return parse(json, {fields: formatFields, transforms})
  } else {
    return parse(json, {transforms})
  }
}


// From https://stackoverflow.com/questions/17575790/environment-detection-node-js-or-browser
/**
 * @return {boolean}
 */
export function isBrowser() {
  const isBrowser = new Function('try {return this===window;}catch(e){ return false;}')
  return isBrowser()
}


/**
 * @return {boolean}
 */
export function isNode() {
  const isNode = new Function('try {return this===global;}catch(e){return false;}')
  return isNode()
}


