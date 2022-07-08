import esbuild from 'esbuild'


const entry = 'lib/src/ifctool.js'
const buildDir = 'dist'
const build = {
  entryPoints: [entry],
  bundle: true,
  minify: false,
  // https://esbuild.github.io/api/#keep-names
  // We use code identifiers e.g. in ItemProperties for their names
  keepNames: true,
  sourcemap: true,
  outfile: buildDir + '/ifclib.js',
  format: 'esm',
  platform: 'browser',
  target: ['chrome58', 'firefox57', 'safari11', 'edge18'],
  external: [
    './node_modules/log4js/*',
    './node_modules/fs-extra/*',
    './node_modules/graceful-fs/*',
  ],
}

esbuild
    .build(build)
    .then((result) => {
      console.log('Build succeeded.')
    })
    .catch((msg) => {
      console.error(msg)
      process.exit(1)
    })
