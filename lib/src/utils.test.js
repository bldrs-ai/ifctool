import {
  fieldHasValue,
  simpleCsv2Json,
  jsonToCsv,
} from './utils.js'


describe('utils', () => {
  const testObj = {
    a: 0,
    b: {
      c: 0,
      d: null,
    },
    e: null,
  }


  test('fieldHasValue', () => {
    expect(fieldHasValue(testObj, [])).toBe(false)
    expect(fieldHasValue(testObj, ['a'])).toBe(true)
    expect(fieldHasValue(testObj, ['b'])).toBe(true)
    expect(fieldHasValue(testObj, ['c'])).toBe(false)
    expect(fieldHasValue(testObj, ['b', 'c'])).toBe(true)
    expect(fieldHasValue(testObj, ['b', 'd'])).toBe(false)
    expect(fieldHasValue(testObj, ['b', 'd'])).toBe(false)
    expect(fieldHasValue(testObj, ['e'])).toBe(false)
  })


  test('simpleCsv2Json', () => {
    expect(simpleCsv2Json('a')).toStrictEqual(['a'])
  })


  test('jsonToCsv', () => {
    expect(jsonToCsv({})).toBe('')
    expect(jsonToCsv({a: 1})).toBe('"a"\n1')
    expect(jsonToCsv({a: 1, b: 2})).toBe('"a","b"\n1,2')
    expect(jsonToCsv({a: 1, b: 2})).toBe('"a","b"\n1,2')
    expect(jsonToCsv({a: 1, b: 2, c: null}, true)).toBe('"a","b","c"\n1,2,')
    expect(jsonToCsv({a: 1, b: null, c: 3}, true)).toBe('"a","b","c"\n1,,3')
    expect(jsonToCsv(testObj, true)).toBe('"a","b","e"\n0,"{""c"":0,""d"":null}",')
    expect(jsonToCsv(testObj, true, 'a,b.c')).toBe('"a","b.c"\n0,0')
  })
})
