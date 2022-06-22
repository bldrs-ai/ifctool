import fs from 'fs'
import IfcModel from './IfcModel.js'


let ifcFilename = 'IFCFile'
const IFCSpacesELementsArrAll = []
const USAGE = `Usage: node extractLevel.js <file.ifc>
EXAMPLE
node extractLevel.js index.ifc
OUT:
index.ifc_Level0.ifc
index.ifc_Level1.ifc
...
`

extractLevels()

/** main function */
async function extractLevels() {
  const relElementsGrouped = await extractRELID()
  await createManipulateNewIFC(relElementsGrouped)
}

/** open IFC model and extract related elements */
async function extractRELID() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.error(USAGE)
    return
  }
  ifcFilename = args[0]
  console.log(ifcFilename)
  const model = new IfcModel()
  const rawFileData = fs.readFileSync(ifcFilename)
  await model.open(rawFileData)
  console.log(model.modelId)

  const ifcRelSpatial = model.getEltsOfNamedType('IFCRELCONTAINEDINSPATIALSTRUCTURE')
  const ifcSpace = model.getEltsOfNamedType('IFCSPACE')
  const AllrelElementsArr = []

  for (let i = 0; i< ifcRelSpatial.length; i++) {
    const relElements = ifcRelSpatial[i].RelatedElements
    const relElementsArr = []

    for (let j = 0; j < relElements.length; j++) {
      relElementsArr[j] = relElements[j].value
    }
    AllrelElementsArr[i] = relElementsArr
  }
  for (let i = 0; i< ifcSpace.length; i++) {
    IFCSpacesELementsArrAll[i] = ifcSpace[i].expressID
  }
  const relElementsGroupedAll = groupElements(AllrelElementsArr)
  return relElementsGroupedAll
}

/** Group related element arrays for removal of each level
 * @param {[]} elementArray - extracted related element arrays from IFC file
 * @return {[]} groupedElements
*/
function groupElements(elementArray) {
  const groupedElements = []
  for (let i = 0; i<elementArray.length+1; i++) {
    let joinedArray = []
    joinedArray = elementArray
    joinedArray.splice(i, 1)
    const flatElements = joinedArray.flat()
    groupedElements[i] = flatElements
  }
  return groupedElements
}

/** Create a set of new IFC files and remove related elements fot each level
 * @param {[]} relatedElemGrouped express IDs of grouped related elements for each level
 */
function createManipulateNewIFC(relatedElemGrouped) {
  for (let i = 0; i<relatedElemGrouped.length; i++) {
    const newfilename = ifcFilename+'_Level'+i+'.ifc'
    copyFilesPromise(ifcFilename, newfilename, relatedElemGrouped[i])
  }
}

/** Create map to find Line numbers based on expressID
 * @param {string} IFCdata - Input raw IFC data
 * @return {Map} Map with Express IDs as keys
*/
function expressIDtoLineMap(IFCdata) {
  const expressIDMaps = new Map()
  const lines = IFCdata.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    {
      if ((line.indexOf('#') != -1) && (line.indexOf('=') != -1)) {
        const data1 = line.split('#')
        const data2 = data1[1].split('=')
        const expressID = data2[0]
        expressIDMaps.set(parseInt(expressID), i)
      }
    }
  }
  return expressIDMaps
}

/** Find lines based on an array of express IDs
  * @param {string} IFCdata - Input raw IFC data
  * @param {[]} expressIDs - array of expressIDs to be removed
  * @return {[]} list of lines corresponding to the input array of expressIDs
 */
function findLinesWithExpressID(IFCdata, expressIDs = []) {
  const expressIDMap = expressIDtoLineMap(IFCdata)
  const lineIndexes = []
  for (let i = 0; i < expressIDs.length; i++) {
    try {
      lineIndexes[i] = expressIDMap.get(expressIDs[i])
    } catch {
      void(0)
    }
  }
  return lineIndexes
}
const removeLines = (data, lines = []) => {
  return data
      .split('\n')
      .filter((val, idx) => lines.indexOf(idx) === -1)
      .join('\n')
}

/** Remove lines from an IFC file with an array of expressIDs
 * @param {string} filename - filename of new IFC file to remove elements
 * @param {[]} expressIDsToRemove - array of expressIDs to remove
 */
function removeLinesFromIFCwithExpressID(filename, expressIDsToRemove) {
  const fileCopiedBool = true
  if (fileCopiedBool) {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) throw err
      const linesToRemove = findLinesWithExpressID(data, expressIDsToRemove)
      console.log('Lines to remove from '+filename+' are '+linesToRemove)
      fs.writeFile(filename, removeLines(data, linesToRemove), 'utf8', function(err) {
        if (err) throw err
        console.log('Lines '+linesToRemove+' have been removed from '+filename)
      })
    })
  } else {
    console.log('Files not copied yet')
  }
}

/** Create new IFC file and remove lines
 * @param {string} IFCfilename - filename of target IFC file
 * @param {string} newfilename - filename of new IFC file for each level
 * @param {[]} expressIDsToRemoveIFCRel - array of expressIDs to remove
 * @return {promise} - promise relolution for creating new file
 */
function copyFilesPromise(IFCfilename, newfilename, expressIDsToRemoveIFCRel) {
  return new Promise((resolve, reject)=>{
    fs.copyFile(IFCfilename, newfilename, (err) => {
      if (err) {
        console.log('File '+newfilename+' was not created')
        reject
        throw err
      } else {
        console.log('File '+newfilename+' is created')
        resolve(true)
        removeLinesFromIFCwithExpressID(newfilename, expressIDsToRemoveIFCRel)
      }
    })
  })
}
