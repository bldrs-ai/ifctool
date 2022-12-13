import {STRING} from 'web-ifc'
import {
  decodeIFCString,
  deref,
  isTypeValue,
} from './Ifc'


test('isTypeValue', () => {
  expect(isTypeValue({value: 'foo'})).toBeFalsy()
  expect(isTypeValue({
    type: STRING,
    value: 'foo',
  })).toBeTruthy()
})


test('decodeIfcString', () => {
  const someAscii = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  expect(someAscii).toEqual(decodeIFCString(someAscii))
  expect('Küche').toEqual(decodeIFCString('K\\X2\\00FC\\X0\\che'))
})


test('deref simple', async () => {
  const label = 'test val'
  expect(await deref(label)).toEqual(label)
})
