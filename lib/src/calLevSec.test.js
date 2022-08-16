import * as calLevSec from './calLevSec'
import * as extractLevels from './extractLevels'


describe('unitTests', () => {
  it('addHeight', () => {
    const levelHeights = [0, 10]
    const expected = [5, 15]
    expect(calLevSec.addOffsetHeight(levelHeights, 5)).toStrictEqual(expected)
  })

  it('CameraHeight', () => {
    const levelHeights = [0, 10, 20, 5, 40]
    const expected = 120
    expect(calLevSec.calTargetCameraZ(levelHeights)).toStrictEqual(expected)
  })
})

describe('sampleFileTests', () => {
  it('extractIFCStoreyHeight', async () => {
    const inputIFCSample = './testdata/sample_extractLevels.ifc'
    process.argv = ['node', 'extractLevels.test.js', inputIFCSample]
    expect(extractLevels.getArgInputFilename(calLevSec.getUsage())).toBe(inputIFCSample)
    const heights = await calLevSec.extractHeight('lib/src/testdata/sample_extractLevels.ifc')
    expect(heights).toStrictEqual([0, 2.7])
  })
})
