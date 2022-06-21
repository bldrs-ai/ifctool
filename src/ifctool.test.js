import fs from 'fs'
import {jest} from '@jest/globals'
import {
  processArgs,
  parseFlags,
  processFile,
} from './ifctool'


describe('ifctool', () => {
  test('parseFlags', () => {
    expect(parseFlags([])).toStrictEqual({})
    expect(parseFlags(['--foo'])).toStrictEqual({foo: true})
    expect(parseFlags(['--foo=bar'])).toStrictEqual({foo: 'bar'})
    expect(parseFlags(['--foo=bar', '--baz=blee'])).toStrictEqual({foo: 'bar', baz: 'blee'})
  })


  test('processFile', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
    const bs7m = fs.readFileSync(
        './src/testdata/IFC_2x3/7m900_tue_hello_wall_with_door.ifc')
    const ifcPropsJSON = await processFile(bs7m, {elts: '1'})
    const obj = JSON.parse(ifcPropsJSON)
    expect(obj.expressID).toBe(1)
    expect(obj.type).toBe(103090709)
    expect(obj.GlobalId.type).toBe(1)
    expect(obj.GlobalId.value).toBe('0YvctVUKr0kugbFTf53O9L')
    expect(console.log).toBeCalledTimes(1)
    consoleLogMock.mockRestore()
  })


  test('processArgs', async () => {
    const consoleWarnMock = jest.spyOn(console, 'error').mockImplementation()
    const ret = await processArgs([])
    expect(ret).toBe(1)
    expect(console.error).toBeCalledTimes(1)
    consoleWarnMock.mockRestore()
  })
})
