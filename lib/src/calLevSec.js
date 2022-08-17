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


// UNCOMMENT FOR INITIAL TESTING
// calSecLevels()
/** Main function. */
export async function calSecLevels() {
  const inputIfcFilename = getArgInputFilename(getUsage())
  const elevValuesAll = await extractHeight(inputIfcFilename)
  const offsetHeight = 0.9
  const selLevelsHeight = addOffsetHeight(elevValuesAll, offsetHeight)
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
  for (let i = 0; i < ifcBuildingStorey.length; i++) {
    elevValues[i] = ifcBuildingStorey[i].Elevation.value
  }
  return elevValues
}


/**
 * Offset elevation value by a given height.
 * @param {array} elevValues Array of all elevation values.
 * @param {Number} offsetHeight Value of offset height.
 * @return {array} Offset height values.
 */
export function addOffsetHeight(elevValues, offsetHeight) {
  const offElevValues = []
  for (let i = 0; i < elevValues.length; i++) {
    offElevValues[i] = elevValues[i] + offsetHeight
  }
  return offElevValues
}


/**
 * Calculate the z value (height) of the camera position based on
 * estimate height of building.
 * @param {array} elevValues Array of all elevation values.
 * @param {Number} screenSizeCo Coefficient value based on screensize.
 * @return {Number} Target camera position.
 */
export function calTargetCameraZ(elevValues, screenSizeCo = 3) {
  let tallestHeight = 0
  for (let i = 0; i < elevValues.length; i++) {
    if (elevValues[i] > tallestHeight) tallestHeight = elevValues[i]
  }
  const cameraZ = tallestHeight * screenSizeCo
  return cameraZ
}
