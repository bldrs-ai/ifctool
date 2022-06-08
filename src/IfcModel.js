import WebIFC from 'web-ifc'
import * as IfcHelper from './Ifc.js'
import IfcTypesMap from './IfcTypesMap.js'


const typeIdsByName = {}
for (let id in IfcTypesMap) {
  const name = IfcTypesMap[id]
  typeIdsByName[name] = parseInt(id)
}


/**
 * Test wrapper for WebIFC.IfcAPI
 */
export default class IfcModel {
  constructor() {
    this.webIfc = new WebIFC.IfcAPI();
  }

  /** @param {byte[]} rawFileData The IFC file bytes. */
  async open(rawFileData) {
    await this.webIfc.Init()
    this.modelId = this.webIfc.OpenModel(
      rawFileData,
      /* optional settings object */
    );
  }


  /** @param {number} expressId */
  getElt(expressId) {
    if (expressId == undefined)
      throw new Error('Must provide an Express ID')
    const elt = this.webIfc.GetLine(this.modelId, expressId, true)
    return elt
  }


  /** @param {string} elt IFC element */
  getEltsOfNamedType(typeName) {
    const typeId = typeIdsByName[typeName]
    if (typeId == undefined) throw new Error('Unknown type name: ', typeName)
    const properties = this.webIfc.GetLineIDsWithType(this.modelId, typeId);
    const lines = []
    for (let i = 0; i < properties.size(); i++) {
      let expressID = parseInt(properties.get(i));
      lines.push(this.webIfc.GetLine(this.modelId, expressID))
    }
    return lines
  }


  async deref(elt) {
    return await IfcHelper.deref(elt, this.webIfc)
  }


  /** Dispose of resources used by the WebIFC API. */
  close() {
    this.webIfc.CloseModel(this.modelId);
  }
}
