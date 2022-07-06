#!/usr/bin/env node


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
import {processArgs} from './ifctool.js'


process.exitCode = await processArgs(process.argv.slice(2))

