import {
  decodeIFCString,
  deref,
  isTypeValue,
} from './Ifc'


test('isTypeValue', () => {
  expect(isTypeValue({
    type: 1,
    value: 'foo',
  })).toBeTruthy()

  expect(isTypeValue({value: 'foo'})).toBeFalsy()
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
