import {getLogger} from '../../logger.js'


const logger = getLogger('calLevSec.js')

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


/**
 * Main function.
 *
 * @param {object} model
 * @param {object} config
 * @param {object} globalFlags
 * @param {object} ifcProps
 * @param {object} results previous stage results
 * @return {object} result
 */
export function calSecLevels(model, config, globalFlags, ifcProps, results) {
  logger.debug('calSecLevels.js#calSecLevels')
  if (config.help) {
    logger.log(getUsage())
    return {status: 'error'}
  }
  const elevValuesAll = extractHeight(model)
  const offsetHeight = 0.9
  const selLevelsHeight = addOffsetHeight(elevValuesAll, offsetHeight)
  return {status: 'ok', levelHeights: selLevelsHeight}
}


/**
 * Extract related elements.
 *
 * @param {object} model
 * @return {Array} elevation values
 */
export function extractHeight(model) {
  logger.debug('calSecLevels.js#extractHeight')
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
 *
 * @param {Array} elevValues Array of all elevation values.
 * @param {number} offsetHeight Value of offset height.
 * @return {Array} Offset height values.
 */
export function addOffsetHeight(elevValues, offsetHeight) {
  logger.debug('calSecLevels.js#addOffsetHeight')
  const offElevValues = []
  for (let i = 0; i < elevValues.length; i++) {
    offElevValues[i] = elevValues[i] + offsetHeight
  }
  return offElevValues
}


/**
 * Calculate the z value (height) of the camera position based on
 * estimate height of building.
 *
 * @param {Array} elevValues Array of all elevation values.
 * @param {number} screenSizeCo Coefficient value based on screensize.
 * @return {number} Target camera position.
 */
export function calTargetCameraZ(elevValues, screenSizeCo = 3) {
  let tallestHeight = 0
  for (let i = 0; i < elevValues.length; i++) {
    if (elevValues[i] > tallestHeight) {
      tallestHeight = elevValues[i]
    }
  }
  const cameraZ = tallestHeight * screenSizeCo
  return cameraZ
}
