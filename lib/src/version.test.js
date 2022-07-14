import {getPackageVersion} from './version.js'


test('getPackageVersion has major.minor.patch format', () => {
  expect(getPackageVersion().search(/\d+\.\d+.\d+/) != -1).toBeTruthy()
})
