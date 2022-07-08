import {Exception} from '@bldrs-ai/ifclib/src/utils.js'


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
