import fs from 'fs'
import {IFCPROJECT} from 'web-ifc'
import {jest} from '@jest/globals'
import {
  processIfcBuffer,
} from './ifctool'


describe('ifctool', () => {
  it('process a valid IFC buffer', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
    const bs7m = fs.readFileSync(
        './src/testdata/IFC_2x3/7m900_tue_hello_wall_with_door.ifc')
    const ifcPropsJSON = await processIfcBuffer(bs7m, {elts: '1'})
    const ifcJson = JSON.parse(ifcPropsJSON)
    const data0 = ifcJson.data[0]
    expect(data0.expressID).toBe(1)
    expect(data0.type).toBe(IFCPROJECT)
    expect(data0.GlobalId.type).toBe(1)
    expect(data0.GlobalId.value).toBe('0YvctVUKr0kugbFTf53O9L')
    expect(consoleLogMock).toBeCalledTimes(1)
    consoleLogMock.mockRestore()
  })
})
