import fs from 'fs'
import {extractRELID} from './extractLevels'
import IfcModel from '../../IfcModel.js'


describe('extractLevels', () => {
  it('extracts relationship IDs correctly', async () => {
    const model = new IfcModel()
    const rawFileData = fs.readFileSync('./lib/src/ops/levels/testdata/sample_extractLevels.ifc')
    await model.open(rawFileData)
    const extractedIds = await extractRELID(model)
    expect(extractedIds.length).toBe(2)
  })
})
