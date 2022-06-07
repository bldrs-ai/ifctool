import esbuild from 'esbuild';


const entry = 'src/ifctool.js'
const buildDir = 'dist'
const build = {
  entryPoints: [entry],
  bundle: true,
  minify: true,
  // https://esbuild.github.io/api/#keep-names
  // We use code identifiers e.g. in ItemProperties for their names
  keepNames: true,
  sourcemap: true,
  outdir: buildDir,
  platform: 'node',
  target: ['node14'],
}

esbuild
  .build(build)
  .then((result) => {
    console.log('Build succeeded.');
  })
  .catch((msg) => {
    console.error(msg)
    process.exit(1)
  });
