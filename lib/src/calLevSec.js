import fs from 'fs'
import IfcModel from './IfcModel.js'
import {getArgInputFilename} from './extractLevels.js'


/** @return {string} Usage */
export function getUsage() {
  return `Usage: node src/calculateSecLevels.js <file.ifc>
EXAMPLE
node calculateSecLevels.js index.ifc
OUT:
[l1x, l1y, l1z]
[l2x, l2y, l2z]
...
`
}

const offHeight = 0.9

// UNCOMMENT FOR INITIAL TESTING
// calSecLevels()

/**
 * Main function
 */
export async function calSecLevels() {
  const inputIfcFilename = getArgInputFilename(getUsage())
  const elevValuesAll = await extractHeight(inputIfcFilename)
  const selLevelsHeight = addOffsetHeight(elevValuesAll, offHeight)
  // console.log(elevValuesAll)
  return selLevelsHeight
}

/**
 * Open IFC model and extract related elements.
 * @param {string} ifcFilename
 * @return {array} related elements
 */
export async function extractHeight(ifcFilename) {
  const model = new IfcModel()
  const rawFileData = fs.readFileSync(ifcFilename)
  await model.open(rawFileData)

  // CHANGES NEEDED AFTER THIS LINE
  const ifcBuildingStorey = model.getEltsOfNamedType('IFCBUILDINGSTOREY')
  const elevValues = []

  for (let i = 0; i< ifcBuildingStorey.length; i++) {
    elevValues[i] = ifcBuildingStorey[i].Elevation.value
  }
  return elevValues
}

/**
 * Offset elevation value by a given height
 * @param {[]} elevValues - Array of all elevation values
 * @param {Number} offsetHeight - Value of offset height
 * @return {[]} - offset height values
 */
export function addOffsetHeight(elevValues, offsetHeight) {
  const offElevValues = []
  for (let i = 0; i< elevValues.length; i++) {
    offElevValues[i] = elevValues[i]+offsetHeight
  }
  return offElevValues
}


