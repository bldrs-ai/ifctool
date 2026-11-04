import * as WebIFC from 'web-ifc'
import * as StepValueTypes from './stepValueTypes.js'


// Guards the hand-copied tags in stepValueTypes.js: if web-ifc ever
// renumbers its tape value types, this fails instead of Ifc.js silently
// mis-decoding values.
describe('stepValueTypes', () => {
  it.each(['STRING', 'LABEL', 'ENUM', 'REAL', 'REF'])('%s matches web-ifc', (name) => {
    expect(WebIFC[name]).toBeDefined()
    expect(StepValueTypes[name]).toBe(WebIFC[name])
  })


  it('has the expected numbering', () => {
    expect(StepValueTypes).toEqual({STRING: 1, LABEL: 2, ENUM: 3, REAL: 4, REF: 5})
  })
})
