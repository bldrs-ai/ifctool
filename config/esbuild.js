import esbuild from 'esbuild'


const entry = 'tool/src/main.js'
const buildDir = 'dist'
const build = {
  entryPoints: [entry],
  bundle: true,
  minify: false,
  // https://esbuild.github.io/api/#keep-names
  // We use code identifiers e.g. in ItemProperties for their names
  keepNames: true,
  sourcemap: true,
  outdir: buildDir,
  format: 'esm',
  platform: 'node',
  target: ['node16'],
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
