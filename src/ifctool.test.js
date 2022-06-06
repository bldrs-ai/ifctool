const {main} = require('./ifctool')


describe('ifctool', () => {
  test('main returns a message', () => {
    expect(main()).toBe('Hello IFC!')
  })
})
