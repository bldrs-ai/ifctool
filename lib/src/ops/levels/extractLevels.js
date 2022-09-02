import fs from 'fs'
import {getLogger} from '../../logger.js'


const logger = getLogger('extractLevels.js')

/** @return {string} Usage */
export function getUsage() {
  return `Usage: node src/extractLevel.js <file.ifc>
EXAMPLE
node extractLevel.js index.ifc
OUT:
index.ifc_Level0.ifc
index.ifc_Level1.ifc
...
`
}


/**
 * Main function.
 * @param {object} model
 * @param {object} config
 * @param {object} globalFlags
 * @param {object} ifcProps
 * @param {object} results previous stage results
 * @return {object} result
 */
export async function extractLevels(model, config, globalFlags, ifcProps, results) {
  console.error('HERE')
  logger.debug('extractLevels.js#extractLevels')
  if (config.help) {
    logger.log(getUsage())
    return
  }
  const relElementsGrouped = await extractRELID(model)
  await createManipulateNewIFC(config.__meta.inputFilename, relElementsGrouped)
  return {status: 'ok'}
}


/**
 * Extract related elements from the model.
 * @param {object} model IFC model
 * @return {array} Related elements.
 */
export async function extractRELID(model) {
  logger.debug('extractLevels.js#extractRELID')
  const ifcRelSpatial = model.getEltsOfNamedType('IFCRELCONTAINEDINSPATIALSTRUCTURE')
  const AllrelElementsArr = []

  for (let i = 0; i < ifcRelSpatial.length; i++) {
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
 * Group related element arrays for removal of each level.
 * @param {array} elementArray Extracted related element arrays from
 *     IFC file.
 * @return {array} groupedElements
 */
function groupElements(elementArray) {
  logger.debug('extractLevels.js#groupElements')
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
 * Create a set of new IFC files and remove related elements fot each level.
 * @param {string} inputIfcFilename
 * @param {array} relatedElemGrouped Express IDs of grouped related
 *     elements for each level
 */
function createManipulateNewIFC(inputIfcFilename, relatedElemGrouped) {
  logger.debug('extractLevels.js#createManipulateNewIFC')
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
        logger.log(`${filename} is ready`)
      })
    })
  } else {
    logger.log('Files not copied yet')
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
