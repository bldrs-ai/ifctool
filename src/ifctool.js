import fs from 'fs'
import IfcModel from './IfcModel.js'
import * as Arrays from './arrays.js'
import {Exception, jsonToCsv} from './utils.js'
import {getPackageVersion} from './version.js'
import {getLogger, logLevels, setLogLevel} from './logger.js'


const USAGE = `Usage: node src/main.js <file.ifc> [--flag=value]*
  <command> may be one of:

  --elts=id1[,id2,...]    Print the IFC elements with the given IDs
  --types=t1[,t2,...]     Print the IFC elements of the given types, case insensitive
  --deref                 Dereference complex elements (work in progress)
  --out=json|csv          Print as JSON (default) or CSV.  See https://github.com/buildingSMART/ifcJSON
    --fmt=...             Format CSV, see: https://www.npmjs.com/package/json2csv
  --omitExpressId         Omit expressID
  --omitNull              Omit fields will null values
  --log=[enum =>]         Set log level to one of: {off,error,exception,info,debug,verbose}.
                            default=info

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

const logger = getLogger('ifctool.js')


/**
 * Main entry point for ifctool.
 * @param {Array<string>} args
 * @return {number} 0 on success, 1 on error.
 */
export async function processArgs(args) {
  if (args.length < 1) {
    exceptionWithUsage(USAGE)
    return 1
  }
  let ifcProps = null
  try {
    const ifcFilename = args[0]
    const flags = parseFlags(args.slice(1))
    if (flags.log) {
      const logLevel = flags.log
      if (!logLevels.includes(logLevel)) {
        throw new Error('Log level must be one of: ' + JSON.stringify(logLevels))
      }
      setLogLevel(logLevel)
    }
    const rawFileData = fs.readFileSync(ifcFilename)
    ifcProps = await processFile(rawFileData, flags)
  } catch (e) {
    if (e instanceof Exception) {
      exceptionWithUsage(e)
      return 1
    }
    if (e instanceof Error) {
      internalError(e)
      return 1
    }
  }
  if (ifcProps != null) {
    console.log(ifcProps)
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
      internalError(e)
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
    ifcProps = await Promise.all(eltIds.map(async (eltId) => (
      await model.getProperties().getItemProperties(0, eltId, false)
    )))
    const missing = removeMismatchedIds(eltIds, ifcProps)
    if (missing.length > 0) {
      logger.debug('Missing elts:', missing)
    }
    if (Array.isArray(ifcProps) && ifcProps.length == 1) {
      ifcProps = ifcProps[0]
    }
    logger.debug('RAW PROPS: ', ifcProps)
  } else if (flags.types) {
    const types = flags.types.split(',')
    ifcProps = types.map((t) => model.getEltsOfNamedType(t.toUpperCase())).flat()
  } else if (flags.spatialRoot) {
    // TODO
  } else {
    // eslint-disable-next-line new-cap
    model.webIfc.CreateIfcGuidToExpressIdMapping(0)
    const guidsContainer = model.webIfc.ifcGuidMap
    let guidsMap = null
    for (const entry of guidsContainer) {
      if (typeof entry[1] == 'object') {
        guidsMap = entry[1]
        break
      }
    }
    const guids = []
    const expressIds = []
    for (const entry of guidsMap) {
      const val = entry[0]
      if (typeof val == 'string') {
        guids.push(val)
      } else {
        expressIds.push(val)
      }
    }
    ifcProps = await Promise.all(expressIds.map(async (eltId) => (
      await model.getProperties().getItemProperties(0, eltId, false)
    )))
    logger.debug('ifcProps: ', ifcProps)
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
    ifcProps = await model.deref(ifcProps)
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
  // TODO(pablo): better to pre-filter the data as it's being assembled instead of here.
  ifcProps = JSON.parse(JSON.stringify(ifcProps, (k, v) => {
    if (flags.omitExpressId && k == 'expressID') {
      return undefined
    }
    if (flags.omitNull && (v === null || v == 'null')) {
      return undefined
    }
    return v
  }))
  let outputJson = true
  if (flags.out) {
    if (flags.out == 'csv') {
      ifcProps = jsonToCsv(ifcProps, flags.omitNull, flags.fmt)
      outputJson = false
    } else if (flags.out == 'json') {
      // No-op, this is the default, but lets the user be explicit and
      // is backward compatible if we want to make it not default.
    } else {
      internalError('Unsupported output format: ' + flags.out)
      return null
    }
  }
  if (outputJson) {
    ifcProps = createHeader(ifcProps)
    ifcProps = JSON.stringify(ifcProps, null, 2)
  }
  return ifcProps
}


/**
 * @param {object} ifcProps value to use for data element of header
 * @return {object} ifcHeader
 */
function createHeader(ifcProps) {
  const version = getPackageVersion()
  const header = {
    type: 'ifcJSON',
    version: '0.0.1',
    schemaIdentifier: '<unknown; TODO(pablo)>',
    originatingSystem: `IFC2JSON_js ${version}`,
    preprocessorVersion: `web-ifc 0.0.34`,
    timeStamp: new Date().toISOString(),
    data: Array.isArray(ifcProps) ? ifcProps : [ifcProps],
  }
  return header
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


const exceptionWithUsage = (errOrMsg) => {
  logger.warn('Invalid input: ', errOrMsg.message, 'Try --help to see usage instructions')
}


const internalError = (errOrMsg, ...rest) => {
  if (errOrMsg instanceof Error) {
    logger.error('Error: ', errOrMsg.message)
  } else {
    logger.error(errOrMsg, ...rest)
  }
}
