import WebIFC from 'web-ifc'
import fs from 'fs'


async function readIfc(expressId) {
  const ifcApi = new WebIFC.IfcAPI();
  await ifcApi.Init();
  const rawFileData = fs.readFileSync('index.ifc')
  let modelID = ifcApi.OpenModel(
    rawFileData,
    /* optional settings object */
  );
  console.log(`line ${expressId}: `, ifcApi.GetLine(modelID, expressId, true))
  ifcApi.CloseModel(modelID);
}


/**
 * @return {string} Message
 */
export function main() {
  const args = process.argv.slice(2)
  console.log('args: ', args)
  readIfc(args[0] != undefined ? parseInt(args[0]) : 0)
  return 'Hello IFC!'
}


main()
