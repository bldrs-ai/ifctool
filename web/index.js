import * as ifclib from './ifclib.js'


export async function convert() {
  const ifcElt = document.getElementById('ifc')
  const jsonElt = document.getElementById('json')
  const utf8Encode = new TextEncoder()
  const ifc = ifcElt.value
  const buf = utf8Encode.encode(ifc)
  const ifcProps = await ifclib.processIfcBuffer(buf, {
    deref: true,
    omitNull: true,
    elts: '20',
  })
  jsonElt.value = ifcProps
}

convert()


document.getElementById('convert-btn').onclick = convert
