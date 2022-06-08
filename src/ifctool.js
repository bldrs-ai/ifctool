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

Recurse

  node src/ifctool.js index.ifc --elt=1 --recurse=true
`

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

export async function main() {
  let args = process.argv.slice(2)
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
    if (flags.recurse) {
      ret = await Promise.all([ret].flat().map((elt) => {
        return model.deref(elt)
      }).flat())
    }
    if (flags.out && flags.out == 'csv') {
      if (flags.fmt != undefined) {
        const fields = JSON.parse(flags.fmt)
        ret = parse(ret, {fields})
      } else {
        ret = parse(ret)
      }
    }
    console.log(ret)
  } catch (e) {
    console.trace(e)
  }
}


main()
