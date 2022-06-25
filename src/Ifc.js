import {stoi} from './strings.js'
import * as IfcTypesMap from './IfcTypesMap.js'
import debug from './debug.js'


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
 * @param {Object} ref
 * @param {Object} webIfc
 * @return {any}
 */
export async function derefasdf(ref, webIfc = null) {
  return ref
}


/**
 * Recursive dereference of nested IFC. If ref.type is (1-4), viewer and typeValCb will not be used.
 * @param {Object} ref The element to dereference
 * @param {Object} webIfc IFC model
 * @return {any} A flattened version of the referenced element.  TODO(pablo): clarify type.
 */
export async function deref(ref, webIfc = null) {
  if (ref === null || ref === undefined) {
    return 'null'
  }
  if (isTypeValue(ref)) {
    debug().error('deref: isTypeValue')
    switch (ref.type) {
      case 1: return decodeIFCString(ref.value) // typically strings.
      case 2: return ref.value // no idea.
      case 3: return ref.value // no idea.. values are typically in CAPS
      case 4: return ref.value // typically measures of space, time or angle.
      case 5: {
        // HACK(pablo): replace 0 below with modelId
        const refId = stoi(ref.value)
        return await deref(await webIfc.properties.getItemProperties(0, refId, true), webIfc)
      }
      default:
        return 'Unknown type: ' + ref.value
    }
  } else if (Array.isArray(ref)) {
    // Dereference array values.
    (async () => {
      for (let i = 0; i < ref.length; i++) {
        ref[i] = await deref(ref[i], webIfc)
      }
    })()
  } else if (typeof ref === 'object') {
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
      } else {
        ref[objKey] = await deref(val, webIfc)
      }
    }
  }
  return ref // typically number or string.
}
