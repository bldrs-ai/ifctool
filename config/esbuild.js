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
  // Splitting
  // Entry points (our src/index.jsx) are currently not named with
  // cache-busting segments, like index-x84nfi.js, so we should be
  // careful with our caching, i.e. not putting much index.jsx.
  // See:
  //   https://esbuild.github.io/api/#chunk-names
  //   https://github.com/evanw/esbuild/issues/16
  splitting: false,
  outdir: buildDir,
  format: 'esm',
  sourcemap: true,
  target: ['node14'],
  logLevel: 'info',
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
