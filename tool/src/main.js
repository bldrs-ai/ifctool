#!/usr/bin/env node


import {getPackageVersion} from '@bldrs-ai/ifclib'


const USAGE = `usage: ifctool <file.ifc>

options:
  --elts=id1[,id2,...]    Print the IFC elements with the given IDs
  --types=t1[,t2,...]     Print the IFC elements of the given types, case insensitive
  --deref                 Dereference complex elements (work in progress)
  --out=json|csv          Print as JSON (default) or CSV.  See https://github.com/buildingSMART/ifcJSON
    --fmt=...             Format CSV, see: https://www.npmjs.com/package/json2csv
  --omitExpressId         Omit expressID
  --omitNull              Omit fields will null values
  --log=[enum =>]         Set log level to one of: {off,error,exception,info,debug,verbose}.
                            default=info
  --version               Print the version of this tool, same as in package.json.
  --help                  Print these usage instructions.

Version: ifctool ${getPackageVersion()}

# Processing

The tool uses web-ifc to extract data from the IFC.
See https://github.com/tomvandig/web-ifc


## ifcJSON

The output JSON is the result of JSON.stringify, with post-processing
to coerce web-ifc's object representation to ifcJSON.  This is a Work
in Progress.


# Examples

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
import log4js from 'log4js'
import 'log4js/lib/appenders/stderr.js'
import {parseFlags} from './flags.js'
import {Exception, logLevels, processIfcBuffer, setLogLevel} from '@bldrs-ai/ifclib'


log4js.configure({
  appenders: {
    err: {type: 'console', layout: {type: 'basic'}},
  },
  categories: {
    default: {appenders: ['err'], level: 'trace', enableCallStack: true},
  },
})


const logger = log4js.getLogger('main.js')
// TODO(pablo): not sure why this isn't set by lib itself.
setLogLevel('warn')


/**
 * Main entry point for ifctool.
 * @param {Array<string>} args
 * @param {function} print Print function for result.
 * @return {number} 0 on success, 1 on error.
 */
export async function processArgs(args, print=console.log) {
  let ifcProps = null
  try {
    if (args.length < 1) {
      logger.warn('Filename required')
      return 1
    }
    let ifcFilename = null
    if (!args[0].startsWith('--')) {
      ifcFilename = args.shift()
      if (!fs.existsSync(ifcFilename) || !fs.lstatSync(ifcFilename).isFile()) {
        logger.warn('First arg is not file:', ifcFilename)
        return 1
      }
    }
    const flags = parseFlags(args)
    if (flags.log) {
      const logLevel = flags.log
      if (!logLevels.includes(logLevel)) {
        logger.warn('Log level must be one of: ' + logLevels.join(', '))
        return 1
      }
      setLogLevel(logLevel)
    }
    if (flags.version) {
      print(getPackageVersion())
      return 0
    }
    if (flags.help) {
      print(USAGE)
      return 0
    }
    const rawFileData = fs.readFileSync(ifcFilename)
    ifcProps = await processIfcBuffer(rawFileData, flags)
  } catch (e) {
    if (e instanceof Exception) {
      logger.warn(e)
    } else {
      logger.error(e)
    }
    return 1
  }
  if (ifcProps != null) {
    print(ifcProps)
  }
  return 0
}


process.exitCode = await processArgs(process.argv.slice(2))