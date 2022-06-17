#!/usr/bin/env node
import fs from 'fs'
import {parse} from 'json2csv'
import IfcModel from './IfcModel.js'


const USAGE = `Usage: node ifctool.js <file.ifc> [--flag=value]*
  <command> may be one of:

  --elt=id       Print the IFC element with the given ID
  --type=type    Print the IFC elements of the given type, or csv of types, case insensitive
  --out=csv      Print as CSV instead of JSON
    --fields=... Format CSV, see: https://www.npmjs.com/package/json2csv

EXAMPLES

To print the root element of the model:

  node ifctool.js index.ifc --elt=1

As CSV

  node ifctool.js index.ifc --elt=1 --out=csv

With custom formatting

  node src/ifctool.js index.ifc --type=IFCBUILDINGELEMENTPROXY --out=csv --fmt='["Name.value"]'

Dereference basic types, like Ifc names

  node src/ifctool.js index.ifc --elt=1 --deref=basic
`

/**
 * @param {Array<string>} args
 * @return {Array<string>}
 */
function parseFlags(args) {
  const flags = {}
  for (let i = 0; i < args.length; i++) {
    const flag = args[i]
    if (!flag.startsWith('--') || flag.indexOf('=') == -1) {
      throw new Error('Trailing arguments must be in --flag=value form')
    }
    const parts = flag.split('=')
    const name = parts[0].substring(2)
    const value = parts[1]
    flags[name] = value
  }
  return flags
}


/** Main entry point for ifctool. */
export async function main() {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.error(USAGE)
    return
  }
  const ifcFilename = args[0]
  const flags = parseFlags(args.slice(1))

  const model = new IfcModel()
  const rawFileData = fs.readFileSync(ifcFilename)
  await model.open(rawFileData)
  try {
    let ret
    if (flags.elt) {
      ret = model.getElt(parseInt(flags.elt))
      if (ret === undefined) {
        console.error('No element with ID: ' + flags.elt)
        return
      }
    } else if (flags.type) {
      ret = flags.type.split(',').map((t) => model.getEltsOfNamedType(t.toUpperCase())).flat()
    }
    if (flags.deref == 'basic') {
      ret = await Promise.all([ret].flat().map((elt) => {
        return model.deref(elt)
      }).flat())
    }
    if (flags.out && flags.out == 'csv') {
      if (flags.fmt == undefined) {
        ret = parse(ret)
      } else {
        const fields = JSON.parse(flags.fmt)
        ret = parse(ret, {fields})
      }
    }
    console.log(ret)
  } catch (e) {
    console.trace(e)
  }
}


main()
