import {parseFlags} from './flags.js'


describe('flags', () => {
  it('handles no args', () => {
    expect(parseFlags([])).toStrictEqual({})
  })


  it('parses a single flag', () => {
    expect(parseFlags(['--foo'])).toStrictEqual({foo: true})
  })

  it('parses a flag with a value', () => {
    expect(parseFlags(['--foo=bar'])).toStrictEqual({foo: 'bar'})
  })

  it('parses a mix of flags', () => {
    expect(parseFlags(['--foo=bar', '--baz=blee'])).toStrictEqual({foo: 'bar', baz: 'blee'})
  })
})
