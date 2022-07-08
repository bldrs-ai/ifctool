import {stoi} from './strings.js'
import * as IfcTypesMap from './IfcTypesMap.js'
import {getLogger} from './logger.js'


const logger = getLogger('Ifc.js')


/**
 * Check whether both type and value properties are defined and non-null on the object.
 * @param {Object} obj IFC element.
 * @return {boolean} True if and only if
 * the both type and value properties are defined on the object.
 */
export function isTypeValue(obj) {
  if (obj === null || obj == undefined) {
    return false
  }
  const is = obj['type'] != null && obj['value'] != null
  return is
}


/**
 * Get the IFC type.
 * @param {Object} webIfc IFC model.
 * @param {Object} elt IFC element.
 * @return {string} String representation of an IFC element type, e.g. 'IFCELEMENT'
 */
export function getType(webIfc, elt) {
  return webIfc.properties.getIfcType(elt.type)
}


/**
 * Format the type, e.g. given an element of type 'IFCANNOTATION' return 'Note'.
 * @param {Object} webIfc IFC model.
 * @param {Object} elt IFC element.
 * @return {string} A nice human-readable string of the element type of the given element.
 */
export function prettyType(webIfc, elt) {
  switch (getType(webIfc, elt)) {
    case 'IFCANNOTATION': return 'Note'
    case 'IFCBEAM': return 'Beam'
    case 'IFCBUILDING': return 'Building'
    case 'IFCBUILDINGSTOREY': return 'Storey'
    case 'IFCBUILDINGELEMENTPROXY': return 'Element (generic proxy)'
    case 'IFCCOLUMN': return 'Column'
    case 'IFCCOVERING': return 'Covering'
    case 'IFCDOOR': return 'Door'
    case 'IFCFLOWSEGMENT': return 'Flow Segment'
    case 'IFCFLOWTERMINAL': return 'Flow Terminal'
    case 'IFCPROJECT': return 'Project'
    case 'IFCRAILING': return 'Railing'
    case 'IFCROOF': return 'Roof'
    case 'IFCSITE': return 'Site'
    case 'IFCSLAB': return 'Slab'
    case 'IFCSPACE': return 'Space'
    case 'IFCWALL': return 'Wall'
    case 'IFCWALLSTANDARDCASE': return 'Wall (std. case)'
    case 'IFCWINDOW': return 'Window'
    default:
      return elt.type
  }
}


/**
 * Helper to get the named property value from the given element,
 * or else undefined. Equivalent to `element[propertyName].value`, but with checks.
 * @param {Object} element IFC element.
 * @param {string} propertyName Name of the property of the element to retrieve.
 * @return {any|undefined} The property's value.
 */
function getValueOrUndefined(element, propertyName) {
  if (element[propertyName]) {
    if (element[propertyName].value) {
      return element[propertyName].value
    }
  }
  return undefined
}


/**
 * Return the name of the given element if it exists otherwise null.
 * @param {Object} elt IFC element.
 * @return {string|null} The element name.
 */
export function getName(elt) {
  return elt.Name ? elt.Name.value.trim() : null
}


/**
 * Return legible name.
 * @param {Object} webIfc IFC model.
 * @param {Object} element IFC element.
 * @return {string} A human-readable name.
 */
export function reifyName(webIfc, element) {
  if (element.LongName) {
    if (element.LongName.value) {
      return decodeIFCString(element.LongName.value.trim())
    }
  } else if (element.Name) {
    if (element.Name.value) {
      return decodeIFCString(element.Name.value.trim())
    }
  }
  return prettyType(webIfc, element) + ''
}


/**
 * Get the 'Description' property of the given element.
 * The string will also be decoded for non-ascii characters.
 * @param {Object} element IFC element.
 * @return {function|string} The element's description property.
 */
export function getDescription(element) {
  const val = getValueOrUndefined(element, 'Description')
  return val ? decodeIFCString(val) : val
}


// https://github.com/tomvandig/web-ifc/issues/58#issuecomment-870344068
/**
 * Decode multi-byte character encodings.
 * @param {Object} ifcString IFC element.
 * @return {string} A decoded string.
 */
export function decodeIFCString(ifcString) {
  const ifcUnicodeRegEx = /\\X2\\(.*?)\\X0\\/uig
  let resultString = ifcString
  let match = ifcUnicodeRegEx.exec(ifcString)
  while (match) {
    const unicodeChar = String.fromCharCode(parseInt(match[1], 16))
    resultString = resultString.replace(match[0], unicodeChar)
    match = ifcUnicodeRegEx.exec(ifcString)
  }
  return resultString
}


/**
 * @param {Object} ref The element reference to dereference.
 * @param {Object} webIfc The working ifc model.
 * @param {string} indent For debug formatting.
 * @return {any} The value the reference was referring to.
 */
export async function derefNew(ref, webIfc = null, indent='') {
  logger.debug(indent + 'deref, in...')
  if (ref === null || ref === undefined) {
    return 'null'
  }
  if (Array.isArray(ref)) {
    logger.debug(indent + '... array')
    // Dereference array values.
    await (async () => {
      for (let i = 0; i < ref.length; i++) {
        ref[i] = await deref(ref[i], webIfc, indent + '  ')
      }
    })()
    return ref
  } else if (typeof ref === 'object') { // must be after array check
    logger.debug(indent + '... ref is object: expressID: ', ref.expressID)
    if (isTypeValue(ref)) {
      logger.debug(indent + '.... and is simple typeValue')
      switch (ref.type) {
        case 1: return decodeIFCString(ref.value) // typically strings.
        case 2: return ref.value // no idea.
        case 3: return ref.value // no idea.. values are typically in CAPS
        case 4: return ref.value // typically measures of space, time or angle.
        case 5: {
          // HACK(pablo): replace 0 below with modelId
          const refId = stoi(ref.value)
          return 'ref => ' + refId
          // return await deref(await webIfc.properties.getItemProperties(0, refId, true), webIfc,
          //      indent + '  ')
        }
        default:
          throw new Error('Unknown reference type: ' + ref)
      }
    } else {
      logger.debug(indent + '... and is complex typeValue')
      for (const objKey in ref) {
        if (!Object.prototype.hasOwnProperty.call(ref, objKey)) {
          continue
        }
        const val = ref[objKey]
        // TODO: https://technical.buildingsmart.org/resources/ifcimplementationguidance/ifc-guid/
        // if (objKey == 'GlobalId' && ref.expressID) {
        //   const guid = webIfc.ifcGuidMap.get(parseInt(ref.expressID))
        //   console.error(`#${ref.expressID} GlobalId: `, val, guid)
        // }
        if (objKey == 'type') {
          ref[objKey] = IfcTypesMap.getName(val, true)
        } else if (objKey == 'GlobalId') {
          ref[objKey] = val.value
        } else {
          logger.debug(indent + `.... recurse on key: ${objKey}`)
          // ref[objKey] = await deref(val, webIfc, indent + '  ')
        }
      }
      return ref
    }
  }
  logger.debug(indent + `simple value return`)
  return ref // number or string, e.g. the value of Name or expressID
}


/**
 * Recursive dereference of nested IFC. If ref.type is (1-4), viewer
 * and typeValCb will not be used.
 * @param {Object} ref The element reference to dereference.
 * @param {Object} webIfc The working ifc model.
 * @param {string} indent For debug formatting.
 * @return {any} The value the reference was referring to.
 */
export async function deref(ref, webIfc = null, indent='') {
  logger.debug(indent + 'deref, in...')
  if (ref === null || ref === undefined) {
    return 'null'
  }
  if (Array.isArray(ref)) {
    logger.debug(indent + '... array')
    // Dereference array values.
    await (async () => {
      for (let i = 0; i < ref.length; i++) {
        ref[i] = await deref(ref[i], webIfc, indent + '  ')
      }
    })()
    return ref
  } else if (typeof ref === 'object') { // must be after array check
    logger.debug(indent + '... ref is object: expressID: ', ref.expressID)
    if (isTypeValue(ref)) {
      logger.debug(indent + '.... and is simple typeValue')
      switch (ref.type) {
        case 1: return decodeIFCString(ref.value) // typically strings.
        case 2: return ref.value // no idea.
        case 3: return ref.value // no idea.. values are typically in CAPS
        case 4: return ref.value // typically measures of space, time or angle.
        case 5: {
          // HACK(pablo): replace 0 below with modelId
          const refId = stoi(ref.value)
          const refElt = await deref(await webIfc.properties.getItemProperties(0, refId, true), webIfc)
          // not recursing deref on global elt
          if (refElt.GlobalId) {
            return {
              type: refElt.type,
              ref: refElt.GlobalId,
            }
          }
          return refElt
        }
        default:
          throw new Error('Unknown reference type: ' + ref)
      }
    } else {
      logger.debug(indent + '... and is complex typeValue')
      for (const objKey in ref) {
        if (!Object.prototype.hasOwnProperty.call(ref, objKey)) {
          continue
        }
        const val = ref[objKey]
        // TODO: https://technical.buildingsmart.org/resources/ifcimplementationguidance/ifc-guid/
        // if (objKey == 'GlobalId' && ref.expressID) {
        //   const guid = webIfc.ifcGuidMap.get(parseInt(ref.expressID))
        //   console.error(`#${ref.expressID} GlobalId: `, val, guid)
        // }
        if (objKey == 'type') {
          ref[objKey] = IfcTypesMap.getName(val, true)
        } else if (objKey == 'GlobalId' && val.type == 1) {
          ref[objKey] = val.value
        } else {
          logger.debug(indent + `.... recurse on key: ${objKey}`)
          ref[objKey] = await deref(val, webIfc, indent + '  ')
        }
      }
      return ref
    }
  }
  logger.debug(indent + `simple value: `, typeof ref, ref)
  return ref // number or string, e.g. the value of Name or expressID
}


