import fs from 'fs'
import {
  processIfcBuffer,
} from './ifctool'


describe('ifctool', () => {
  it('process a valid IFC buffer', async () => {
    const bs7m = fs.readFileSync(
        './src/testdata/IFC_2x3/7m900_tue_hello_wall_with_door.ifc')
    const ifcPropsJSON = await processIfcBuffer(bs7m, {elts: '1'})
    const ifcJson = JSON.parse(ifcPropsJSON)
    const data0 = ifcJson.data[0]
    expect(data0.expressID).toBe(1)
    expect(data0.type).toBe(103090709)
    expect(data0.GlobalId.type).toBe(1)
    expect(data0.GlobalId.value).toBe('0YvctVUKr0kugbFTf53O9L')
  })
})
