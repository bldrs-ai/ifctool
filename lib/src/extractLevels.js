import fs from 'fs'
import IfcModel from './IfcModel.js'


/** @return {string} Usage */
function getUsage() {
  return `Usage: node src/extractLevel.js <file.ifc>
EXAMPLE
node extractLevel.js index.ifc
OUT:
index.ifc_Level0.ifc
index.ifc_Level1.ifc
...
`
}


/** Main function. */
export async function extractLevels() {
  const inputIfcFilename = getArgInputFilename()
  const relElementsGrouped = await extractRELID(inputIfcFilename)
  await createManipulateNewIFC(inputIfcFilename, relElementsGrouped)
}


/** @return {string} filename from command line. */
export function getArgInputFilename() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.error(getUsage())
    return
  }
  const ifcFilename = args[0]
  console.log('Input file: ', ifcFilename)
  // TODO(pablo): switch to logger
  return ifcFilename
}


/**
 * Open IFC model and extract related elements.
 * @param {string} ifcFilename
 * @return {array} related elements
 */
export async function extractRELID(ifcFilename) {
  const model = new IfcModel()
  const rawFileData = fs.readFileSync(ifcFilename)
  await model.open(rawFileData)

  const ifcRelSpatial = model.getEltsOfNamedType('IFCRELCONTAINEDINSPATIALSTRUCTURE')
  const AllrelElementsArr = []

  for (let i = 0; i< ifcRelSpatial.length; i++) {
    const relElements = ifcRelSpatial[i].RelatedElements
    const relElementsArr = []

    for (let j = 0; j < relElements.length; j++) {
      relElementsArr[j] = relElements[j].value
    }
    AllrelElementsArr[i] = relElementsArr
  }

  const relElementsGroupedAll = groupElements(AllrelElementsArr)
  return relElementsGroupedAll
}


/**
 * Group related element arrays for removal of each level
 * @param {array} elementArray Extracted related element arrays from IFC file
 * @return {array} groupedElements
 */
function groupElements(elementArray) {
  const groupedElements = []
  for (let i = 0; i < elementArray.length + 1; i++) {
    let joinedArray = []
    joinedArray = elementArray
    joinedArray.splice(i, 1)
    const flatElements = joinedArray.flat()
    groupedElements[i] = flatElements
  }
  return groupedElements
}


/**
 * Create a set of new IFC files and remove related elements fot each level
 * @param {string} inputIfcFilename
 * @param {array} relatedElemGrouped Express IDs of grouped related
 *     elements for each level
 */
function createManipulateNewIFC(inputIfcFilename, relatedElemGrouped) {
  for (let i = 0; i < relatedElemGrouped.length; i++) {
    const newfilename = `${inputIfcFilename}_Level-${i}.ifc`
    copyFiles(inputIfcFilename, newfilename, relatedElemGrouped[i])
  }
}


/**
 * Create map to find Line numbers based on expressID
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


/**
 * Find lines based on an array of express IDs
 * @param {string} IFCdata Input raw IFC data.
 * @param {array} expressIDs Express IDs to be removed.
 * @return {array} list of lines corresponding to the input array of
 *     expressIDs.
 */
function findLinesWithExpressID(IFCdata, expressIDs = []) {
  const expressIDMap = expressIDtoLineMap(IFCdata)
  const lineIndexes = []
  for (let i = 0; i < expressIDs.length; i++) {
    try {
      lineIndexes[i] = expressIDMap.get(expressIDs[i])
    } catch (e) {
      // Hmm? void(0)
      console.error(e)
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


/**
 * Remove lines from an IFC file with an array of expressIDs
 * @param {string} filename - filename of new IFC file to remove elements
 * @param {array} expressIDsToRemove - array of expressIDs to remove
 */
function removeLinesFromIFCwithExpressID(filename, expressIDsToRemove) {
  const fileCopiedBool = true
  if (fileCopiedBool) {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) throw err
      const linesToRemove = findLinesWithExpressID(data, expressIDsToRemove)
      fs.writeFile(filename, removeLines(data, linesToRemove), 'utf8', function(err) {
        if (err) throw err
        console.log(`${filename} is ready`)
      })
    })
  } else {
    console.log('Files not copied yet')
  }
}


/**
 * Create new IFC file and remove lines
 * @param {string} from Filename of input IFC file
 * @param {string} to Filename of new IFC file for each level
 * @param {array} expressIDsToRemoveIFCRel - array of expressIDs to remove
 */
function copyFiles(from, to, expressIDsToRemoveIFCRel) {
  fs.copyFileSync(from, to)
  removeLinesFromIFCwithExpressID(to, expressIDsToRemoveIFCRel)
}
