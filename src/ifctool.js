import fs from 'fs'
import {parse} from 'json2csv'
import IfcModel from './IfcModel.js'
import {Exception} from './utils.js'
import * as Arrays from './arrays.js'


const USAGE = `Usage: node ifctool.js <file.ifc> [--flag=value]*
  <command> may be one of:

  --elts=id1[,id2,...]    Print the IFC elements with the given IDs
  --types=t1[,t2,...]     Print the IFC elements of the given types, case insensitive
  --deref                 Dereference complex elements (work in progress)
  --out=json|csv          Print as JSON (default) or CSV.  See https://github.com/buildingSMART/ifcJSON
    --fields=...          Format CSV, see: https://www.npmjs.com/package/json2csv
  --verbose               Print diagnostic information to error

Processing

The tool uses web-ifc to extract data from the IFC.
See https://github.com/tomvandig/web-ifc


ifcJSON

The output JSON is the result of JSON.stringify, with post-processing
to coerce web-ifc's object representation to ifcJSON.  This is a Work
in Progress.


EXAMPLES

Print the root element of the model in JSON:

  node src/main.js model.ifc

with dereferncing and output as CSV

  node src/main.js model.ifc --deref --out=csv

with custom formatting

  node src/main.js model.ifc --types=IFCWALL,IFCWINDOW --out=csv \\
    --fmt='["expressID","OverallWidth","OverallHeight"]'
`

/**
 * Main entry point for ifctool.
 * @param {Array<string>} args
 * @return {number} 0 on success, 1 on error.
 */
export async function processArgs(args) {
  if (args.length < 1) {
    error(USAGE)
    return 1
  }
  let ifcProps = null
  try {
    const ifcFilename = args[0]
    const rawFileData = fs.readFileSync(ifcFilename)
    const flags = parseFlags(args.slice(1))
    ifcProps = await processFile(rawFileData, flags)
  } catch (e) {
    if (e instanceof Exception) {
      exception(e)
      return 1
    }
    if (e instanceof Error) {
      error(e)
      return 1
    }
  }
  if (ifcProps != null) {
    log(ifcProps)
  }
  return 0
}


/**
 * @param {Array<string>} args
 * @return {object}
 */
export function parseFlags(args) {
  const flags = {}
  for (let i = 0; i < args.length; i++) {
    let flag = args[i]
    if (!flag.startsWith('--')) {
      throw new Exception('Trailing arguments must be in format: --flag or --flag=value')
    }
    flag = flag.substring(2)
    let name = flag
    let value = true
    if (flag.indexOf('=') != -1) {
      const parts = flag.split('=')
      name = parts[0]
      value = parts[1]
    }
    flags[name] = value
  }
  return flags
}


/**
 * @param {Array<byte>} fileData
 * @param {object} flags
 * @param {function} error
 * @return {object} ifcProps
 */
export async function processFile(fileData, flags={}) {
  const model = new IfcModel()
  await model.open(fileData)
  let ifcProps = null
  try {
    ifcProps = await extractIfcProps(model, flags)
    if (ifcProps == null || ifcProps.length == 0) {
      return null
    }
    ifcProps = await maybeDeref(model, ifcProps, flags)
    ifcProps = format(ifcProps, flags)
  } catch (e) {
    if (e instanceof Exception) {
      error(e)
      return null
    }
    throw e
  }
  return ifcProps
}


/**
 * @param {IfcModel} model
 * @param {Array<string>} flags
 */
export async function extractIfcProps(model, flags) {
  let ifcProps = null
  if (flags.elts) {
    const strIds = flags.elts.split(',')
    const eltIds = Arrays.stoi(strIds)
    ifcProps = eltIds.map((eltId) => model.getElt(eltId))
    const missing = removeMismatchedIds(eltIds, ifcProps)
    if (missing.length > 0 && flags.verbose) { // TODO(pablo): add verbose logging
      error('Missing elts:', missing)
    }
    if (Array.isArray(ifcProps) && ifcProps.length == 1) {
      ifcProps = ifcProps[0]
    }
  } else if (flags.types) {
    ifcProps = flags.types.split(',').map((t) => model.getEltsOfNamedType(t.toUpperCase())).flat()
  } else {
    // TODO(pablo): pass modelId as variable
    ifcProps = await model.getProperties().getSpatialStructure(0, true)
  }
  return ifcProps
}


/**
 * @param {IfcModel} model
 * @param {object} ifcProps
 * @param {object} flags
 */
export async function maybeDeref(model, ifcProps, flags) {
  if (flags.deref) {
    ifcProps = model.deref(ifcProps)
    if (Array.isArray(ifcProps)) {
      return await Promise.all(ifcProps.map((elt) => {
        return model.deref(elt)
      }))
    }
    return await model.deref(ifcProps)
  }
  return ifcProps
}


/**
 * @param {object} ifcProps
 * @param {object} flags
 * @return {object} ifcProps
 */
export function format(ifcProps, flags) {
  if (flags.out) {
    if (flags.out == 'csv') {
      if (flags.fmt == undefined) {
        ifcProps = parse(ifcProps)
      } else {
        const fields = JSON.parse(flags.fmt)
        ifcProps = parse(ifcProps, {fields})
      }
    } else if (flags.out == 'json') {
      // No-op, this is the default, but lets the user be explicit and
      // is backward compatible if we want to make it not default.
    } else {
      error('Unsupported output format: ' + flags.out)
      return null
    }
  } else {
    const sep = flags.fmt || 2
    ifcProps = JSON.stringify(ifcProps, null, sep)
  }
  return ifcProps
}


/**
 * Remove elements from each array that don't have matching IDs.
 *
 * This is a workaround for web-ifc, which will incorrectly match the
 * first element in the IFC when queried for a non-existent ID
 *
 * For example, if IDs 1 and 2 are missing and the first ID in the IFC
 * file is 3, web-ifc will yield:
 *
 *   ids: [1,2,3,4]
 *   elts: [
 *     {expressID: 3}
 *     {expressID: 3}
 *     {expressID: 3}
 *     {expressID: 4}
 *
 * and this utility will modify each array to yield:
 *
 *   ids: [3,4]
 *   elts: [
 *     {expressID: 3}
 *     {expressID: 4}
 *   return: [1,2]    // missing elts
 *
 * @param {Array<number>} ids
 * @param {Array<IfcElement>} elts
 * @return {Array} missing items
 */
function removeMismatchedIds(ids, elts) {
  let missing = []
  let i = 0
  while (i < ids.length) {
    if (!Number.isInteger(ids[i])) {
      throw new Error('Id not a number: ', ids[i])
    }
    if (ids[i] != elts[i].expressID) {
      missing = missing.concat(ids.splice(i, 1))
      elts.splice(i, 1)
      continue
    }
    i++
  }
  return missing
}


const log = (...args) => {
  console.log(...args)
}


const exception = (errOrMsg) => {
  console.error('Invalid input: ', errOrMsg.message)
  console.error('Try --help to see usage instructions')
}

const error = (errOrMsg, ...rest) => {
  if (errOrMsg instanceof Error) {
    console.error('Error: ', errOrMsg.message)
  } else {
    console.error(errOrMsg, ...rest)
  }
}
