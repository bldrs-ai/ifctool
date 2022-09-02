import IfcModel from './IfcModel.js'
import * as Arrays from './arrays.js'
import {
  Exception,
  internalError,
  jsonToCsv,
} from './utils.js'
import {getPackageVersion} from './version.js'
import {getLogger} from './logger.js'
import * as IfcTypesMap from './IfcTypesMap.js'
import Pipeline from './ops/Pipeline.js'


const logger = getLogger('ifctool.js')


/**
 * @param {Array<byte>} fileData
 * @param {object} flags flags.__meta will be copied through to pipeline.
 * @return {object} ifcProps
 */
export async function processIfcBuffer(fileData, flags={}) {
  const model = new IfcModel()
  await model.open(fileData)
  let ifcProps = null
  try {
    ifcProps = await extractIfcProps(model, flags)
    if (ifcProps == null || ifcProps.length == 0) {
      return null
    }
    // TODO(pablo): maybe deref should be part of pipeline.
    ifcProps = await maybeDeref(model, ifcProps, flags)
    // Process ops pipeline
    if (flags.pipeline) {
      const pipelineConfig = JSON.parse(flags.pipeline)
      if (!(pipelineConfig.stages && Array.isArray(pipelineConfig.stages))) {
        console.error('--pipeline config object must have "stages" field with array value')
      }
      pipelineConfig.__meta = flags.__meta
      const pipeline = new Pipeline(model, pipelineConfig)
      for (let i = 0; i < pipelineConfig.stages.length; i++) {
        const stageConfig = pipelineConfig.stages[i]
        if (!stageConfig.name) {
          console.error('--pipeline stage config object must have "name" field with non-empty string value')
        }
        if (!stageConfig.config) {
          console.error('--pipeline stage config object must have "config" field with object value')
        }
        pipeline.addStage(stageConfig.name, stageConfig.config, flags)
      }
      const results = pipeline.run(ifcProps, flags)
      // HACK shoehorning this in ifcProps.
      // TODO(pablo): use union type for return results instead.
      ifcProps = format(results, flags)
    } else {
      ifcProps = format(ifcProps, flags)
    }
  } catch (e) {
    if (e instanceof Exception) {
      internalError(e, logger)
      return null
    }
    throw e
  }
  return ifcProps
}


/**
 * @param {IfcModel} model
 * @param {Array<string>} flags
 */
export async function extractIfcProps(model, flags) {
  let ifcProps = null
  if (flags.elts) {
    const strIds = flags.elts.split(',')
    const eltIds = Arrays.stoi(strIds)
    ifcProps = await Promise.all(eltIds.map(async (eltId) => (
      await model.getProperties().getItemProperties(0, eltId, false)
    )))
    const missing = removeMismatchedIds(eltIds, ifcProps)
    if (missing.length > 0) {
      logger.debug('Missing elts:', missing)
    }
    if (Array.isArray(ifcProps) && ifcProps.length == 1) {
      ifcProps = ifcProps[0]
    }
    logger.debug('RAW PROPS: ', ifcProps)
  } else if (flags.types) {
    const types = flags.types.split(',')
    ifcProps = types.map((t) => model.getEltsOfNamedType(t.toUpperCase())).flat()
  } else if (flags.spatialRoot) {
    // TODO
  } else {
    // eslint-disable-next-line new-cap
    model.webIfc.CreateIfcGuidToExpressIdMapping(0)
    const guidsContainer = model.webIfc.ifcGuidMap
    let guidsMap = null
    for (const entry of guidsContainer) {
      if (typeof entry[1] == 'object') {
        guidsMap = entry[1]
        break
      }
    }
    const guids = []
    const expressIds = []
    for (const entry of guidsMap) {
      const val = entry[0]
      if (typeof val == 'string') {
        guids.push(val)
      } else {
        expressIds.push(val)
      }
    }
    logger.info('Model GUIDS: ', guids)
    ifcProps = await Promise.all(expressIds.map(async (eltId) => (
      await model.getProperties().getItemProperties(0, eltId, false)
    )))
    // Add PropertySets
    for (const eltId of expressIds) {
      const pset = await model.getProperties().getPropertySets(0, eltId, true)
      if (pset.length > 0) {
        ifcProps = ifcProps.concat(pset)
      }
    }
    ifcProps = ifcProps.concat(await model.getProperties().getAllItemsOfType(0, IfcTypesMap.getId('IFCRELDEFINESBYPROPERTIES'), true))
    logger.debug('ifcProps: ', ifcProps)
  }
  return ifcProps
}


/**
 * @param {IfcModel} model
 * @param {object} ifcProps
 * @param {object} flags
 */
export async function maybeDeref(model, ifcProps, flags) {
  if (flags.deref) {
    ifcProps = await model.deref(ifcProps)
    if (Array.isArray(ifcProps)) {
      return await Promise.all(ifcProps.map((elt) => {
        return model.deref(elt)
      }))
    }
    return await model.deref(ifcProps)
  }
  return ifcProps
}


/**
 * @param {object} ifcProps
 * @param {object} flags
 * @return {object} ifcProps
 */
export function format(ifcProps, flags) {
  // TODO(pablo): better to pre-filter the data as it's being assembled instead of here.
  ifcProps = JSON.parse(JSON.stringify(ifcProps, (k, v) => {
    if (flags.omitExpressId && k == 'expressID') {
      return undefined
    }
    if (flags.omitNull && (v === null || v == 'null')) {
      return undefined
    }
    return v
  }))
  let outputJson = true
  if (flags.out) {
    if (flags.out == 'csv') {
      ifcProps = jsonToCsv(ifcProps, flags.omitNull, flags.fmt)
      outputJson = false
    } else if (flags.out == 'json') {
      // No-op, this is the default, but lets the user be explicit and
      // is backward compatible if we want to make it not default.
    } else {
      internalError('Unsupported output format: ' + flags.out, logger)
      return null
    }
  }
  if (outputJson) {
    ifcProps = createHeader(ifcProps)
    ifcProps = JSON.stringify(ifcProps, null, 2)
  }
  return ifcProps
}


/**
 * @param {object} ifcProps value to use for data element of header
 * @return {object} ifcHeader
 */
function createHeader(ifcProps) {
  const version = getPackageVersion()
  const header = {
    type: 'ifcJSON',
    version: '0.0.1',
    schemaIdentifier: '<unknown; TODO(pablo)>',
    originatingSystem: `IFC2JSON_js ${version}`,
    preprocessorVersion: `web-ifc 0.0.34`,
    timeStamp: new Date().toISOString(),
    data: Array.isArray(ifcProps) ? ifcProps : [ifcProps],
  }
  return header
}


/**
 * Remove elements from each array that don't have matching IDs.
 *
 * This is a workaround for web-ifc, which will incorrectly match the
 * first element in the IFC when queried for a non-existent ID
 *
 * For example, if IDs 1 and 2 are missing and the first ID in the IFC
 * file is 3, web-ifc will yield:
 *
 *   ids: [1,2,3,4]
 *   elts: [
 *     {expressID: 3}
 *     {expressID: 3}
 *     {expressID: 3}
 *     {expressID: 4}
 *
 * and this utility will modify each array to yield:
 *
 *   ids: [3,4]
 *   elts: [
 *     {expressID: 3}
 *     {expressID: 4}
 *   return: [1,2]    // missing elts
 *
 * @param {Array<number>} ids
 * @param {Array<IfcElement>} elts
 * @return {Array} missing items
 */
function removeMismatchedIds(ids, elts) {
  let missing = []
  let i = 0
  while (i < ids.length) {
    if (!Number.isInteger(ids[i])) {
      throw new Error('Id not a number: ', ids[i])
    }
    if (ids[i] != elts[i].expressID) {
      missing = missing.concat(ids.splice(i, 1))
      elts.splice(i, 1)
      continue
    }
    i++
  }
  return missing
}
