import fs from 'fs'
import {extractRELID} from './extractLevels'
import IfcModel from '../../IfcModel.js'
import {muteSyslog, restoreSyslog} from '../../logger'


describe('extractLevels', () => {
  it('extracts relationship IDs correctly', async () => {
    const model = new IfcModel()
    const rawFileData = fs.readFileSync('./src/ops/levels/testdata/sample_extractLevels.ifc')
    try {
      muteSyslog() // Complains about missing IFCPROJECT
      await model.open(rawFileData)
    } finally {
      restoreSyslog()
    }
    const extractedIds = await extractRELID(model)
    const expectedNumLevels = 2
    expect(extractedIds.length).toBe(expectedNumLevels)
  })
})
