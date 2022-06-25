import fs from 'fs'


/** @return {string} version string from package.json */
export function getPackageVersion() {
  const rawFileData = fs.readFileSync('./package.json')
  const pkgJson = JSON.parse(rawFileData)
  return pkgJson.version
}
