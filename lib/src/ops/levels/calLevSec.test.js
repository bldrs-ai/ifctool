import fs from 'fs'
import * as calLevSec from './calLevSec'
import IfcModel from '../../IfcModel.js'


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
    const model = new IfcModel()
    const rawFileData = fs.readFileSync('./lib/src/ops/levels/testdata/sample_extractLevels.ifc')
    await model.open(rawFileData)
    const heights = await calLevSec.extractHeight(model)
    expect(heights).toStrictEqual([0, 2.7])
  })
})
