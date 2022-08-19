// import fs from 'fs'
// import {extractRELID} from './extractLevels'
import {getArgInputFilename} from './extractLevels'


describe('extractLevels', () => {
  it('parses command args', () => {
    process.argv = ['node', 'extractLevels.test.js', 'index.ifc']
    expect(getArgInputFilename()).toBe('index.ifc')
  })
/*
  it('extracts relationship IDs correctly', () => {
    expect(extractRELID('./lib/src/testdata/haus.ifc').length).toBe(2)
  })

  it('creates two outputs', () => {
    expect(fs.existsSync('haus.ifc_Level0.ifc')).toBe(true)
    expect(fs.existsSync('haus.ifc_Level1.ifc')).toBe(true)
  })


  it('does not include expressIDs that should be absent', () => {
    const sampleExpress = extractRELID('haus.ifc')[1][10]
    const contents = readFileSync('haus.ifc_Level0.ifc', 'utf-8')
    const result = contents.includes('#'+sampleExpress+'= ')
    expect(result).toBe(false)
  })
*/
})
