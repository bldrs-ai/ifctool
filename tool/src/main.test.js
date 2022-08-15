import {jest} from '@jest/globals'
// import log4js from 'log4js'
import {processArgs} from './main.js'


// TODO(pablo): setup for logger mock isn't working
/*
jest.mock('log4js', () => {
  // using the mock factory we mimic the library.

  // this mock function is outside the mockImplementation
  // because we want to check the same mock in every test,
  // not create a new one mock every log4js.getLogger()
  const debug = jest.fn()
  const error = jest.fn()
  const info = jest.fn()
  const warn = jest.fn()
  return {
    getLogger: jest.fn().mockImplementation(() => ({
      level: jest.fn(),
      debug, error, info, warn,
    })),
  }
})


beforeEach(() => {
  // reset modules to avoid leaky scenarios
  jest.resetModules()
})
*/


describe('main', () => {
  it('returns error(1) on no args', async () => {
    const ret = await processArgs([])
    expect(ret).toBe(1)
    // TODO(pablo): setup for logger mock isn't working
    // expect(log4js.getLogger().warn).toBeCalledTimes(1)
  })


  it('processFile produces valid output and logs', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
    let capturedOut = null
    const mockPrint = (jsonOut) => {
      capturedOut = jsonOut
    }
    const resultCode = await processArgs(
        ['./lib/src/testdata/IFC_2x3/7m900_tue_hello_wall_with_door.ifc', '--elts=1'],
        mockPrint)
    expect(capturedOut).not.toBe(null)
    const ifcJson = JSON.parse(capturedOut)
    const data0 = ifcJson.data[0]
    expect(resultCode).toBe(0)
    expect(data0.expressID).toBe(1)
    expect(data0.type).toBe(103090709)
    expect(data0.GlobalId.type).toBe(1)
    expect(data0.GlobalId.value).toBe('0YvctVUKr0kugbFTf53O9L')
    expect(consoleLogMock).toBeCalledTimes(1)
    consoleLogMock.mockRestore()
  })
})