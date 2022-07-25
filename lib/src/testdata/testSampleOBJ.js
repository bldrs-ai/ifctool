/* eslint-disable */
import * as THREE from 'three'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'

export const bbFromObj = []
const loader = new OBJLoader();
loader.load(
  './testSpaceWalls.obj',
  function ( object ) {
    const int = 0
    object.traverse( child => {

        const oBox = new THREE.Box3()
        oBox.setFromObject(child)
        bbFromObj[int] = child
        int++

    } );

  },
);