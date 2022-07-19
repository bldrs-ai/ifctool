import fs from 'fs'
import {extractRELID} from './extractLevels'
import {copyFilesPromise} from './extractLevels'


const ifcTestFilename = './lib/src/testdata/sample_extractLevels.ifc'

test('groupTests', async () => {
  const groupledAll = await extractRELID(ifcTestFilename)
  expect(groupledAll.length).toBe(2)
})

test('fileDuplicationAndManipulation', async () => {
  const copyFileName = './lib/src/testdata/sample_extractLevels_CopyLevel.ifc'
  const sampleExpress = 25
  copyFilesPromise(ifcTestFilename, copyFileName, [sampleExpress], false)

  expect(fs.existsSync(copyFileName)).toBe(true)

  const contents = fs.readFileSync(copyFileName, 'utf-8')
  const result = contents.includes('#'+sampleExpress+'= ')

  expect(result).toBe(false)
})


