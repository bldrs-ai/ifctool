/* eslint-disable new-cap */
/* This rule is for WebIFC API calls which use this style. */
import * as WebIFC from 'web-ifc'
import * as IfcHelper from './Ifc.js'
import * as IfcTypesMap from './IfcTypesMap.js'


/**
 * Test wrapper for WebIFC.IfcAPI
 */
export default class IfcModel {
  /** Just initializes WebIFC API. */
  constructor() {
    this.webIfc = new WebIFC.IfcAPI()
    this.modelId = undefined
  }

  /** @param {byte[]} rawFileData The IFC file bytes. */
  async open(rawFileData) {
    await this.webIfc.Init()
    this.modelId = this.webIfc.OpenModel(rawFileData /* , optional settings object */)
    // web-ifc doesn't expose and header information, so
    // do it the hard way.
    // TODO(pablo): replace with web-ifc API.
    // TODO(pablo): evaluate if needed, no examples in ifcJSON have it.
    // this.headers = this.extractHeaders(rawFileData)
    return true
  }


  /** @param {byte[]} rawFileData */
  extractHeaders(rawFileData) {
    // const fileStr = new String(rawFileData)
    const dataNdx = rawFileData.indexOf(Buffer.from('DATA;'))
    if (dataNdx == -1) {
      throw new Error('IFC file has no section marked "DATA;"')
    }
    const header = Buffer.alloc(dataNdx, 0)
    rawFileData.copy(header, 0, 0, dataNdx)
    // console.log('header: ', header.toString())
  }


  /** @return {object} */
  getProperties() {
    return this.webIfc.properties
  }


  /**
   * @param {number} expressId
   * @return {object} IFC Element
   */
  getElt(expressId) {
    if (expressId == undefined) {
      throw new Error('Must provide an Express ID')
    }
    const elt = this.webIfc.GetLine(this.modelId, expressId, true)
    return elt
  }


  /**
   * @param {string} typeName IFC element type
   * @return {Array<Element>} IFC Element
   */
  getEltsOfNamedType(typeName) {
    const typeId = IfcTypesMap.getId(typeName)
    if (typeId == undefined) throw new Error('Unknown type name: ', typeName)
    const properties = this.webIfc.GetLineIDsWithType(this.modelId, typeId)
    const lines = []
    for (let i = 0; i < properties.size(); i++) {
      const expressID = parseInt(properties.get(i))
      lines.push(this.webIfc.GetLine(this.modelId, expressID))
    }
    return lines
  }


  /**
   * Dereference elements like {type: 5, value: 23423} to {expressID: 23423, ...}.
   * @param {object} elt IFC Element
   */
  async deref(elt) {
    return await IfcHelper.deref(elt, this.webIfc)
  }


  /** Dispose of resources used by the WebIFC API. */
  close() {
    this.webIfc.CloseModel(this.modelId)
  }
}
