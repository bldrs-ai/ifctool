/* eslint-disable */
import fs from 'fs'
import * as THREE from 'three'
import {OBJLoader} from '../../../node_modules/three/examples/jsm/loaders/OBJLoader.js'


/**
 * Patch three.js FileLoader to remove browser environment dependency
 * since we only need to read local files.
 */
THREE.FileLoader.prototype.load = (url, onSuccess, onProgress, onError) => {
  const buf = fs.readFileSync(url, 'utf8')
  onSuccess(buf)
}

export const bbFromObj = []
const loader = new OBJLoader()
loader.load('./lib/src/testdata/testObjExplode.obj', (obj) => {
  let childNdx = 0
  obj.traverse((child) => {
    const oBox = new THREE.Box3()
    oBox.setFromObject(child)
    bbFromObj[childNdx] = child
    childNdx++
  })
})

console.log(bbFromObj.length)