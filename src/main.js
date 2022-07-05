#!/usr/bin/env node


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


/**
 * HACK(pablo): Setup a filtering logger that filters output to remove
 * web-ifc version string.
 */
function filterLogger() {
  if (arguments[0] && typeof arguments[0] == 'string' && arguments[0].startsWith('web-ifc: ')) {
    return
  }
  origLogger(...arguments)
}
const origLogger = console.log
console.log = filterLogger


import fs from 'fs'
import {getLogger, logLevels, setLogLevel} from './logger.js'
import {parseFlags} from './flags.js'
import {processIfcBuffer} from './ifctool.js'
import {Exception, internalError} from './utils.js'


const logger = getLogger('main.js')


/**
 * Main entry point for ifctool.
 * @param {Array<string>} args
 * @param {function} print Print function for result.
 * @return {number} 0 on success, 1 on error.
 */
export async function processArgs(args, print=console.log) {
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
    ifcProps = await processIfcBuffer(rawFileData, flags)
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
    print(ifcProps)
  }
  return 0
}


const exceptionWithUsage = (errOrMsg) => {
  logger.warn('Invalid input: ', errOrMsg.message, 'Try --help to see usage instructions')
}


process.exitCode = await processArgs(process.argv.slice(2))
