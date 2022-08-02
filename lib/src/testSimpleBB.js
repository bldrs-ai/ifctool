/* eslint-disable */
import * as THREE from '../node_modules/three/build/three'

const box1 = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(20, .3, 5))
const box2 = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(.3, 15, 5))
const box3 = new THREE.Box3(new THREE.Vector3(9.7, 0, 0), new THREE.Vector3(10, 10, 5))
const box4 = new THREE.Box3(new THREE.Vector3(0, 9.7, 0), new THREE.Vector3(15, 10, 5))
const box5 = new THREE.Box3(new THREE.Vector3(0, 5, 0), new THREE.Vector3(5, 5.3, 5))
const box6 = new THREE.Box3(new THREE.Vector3(5, 0, 0), new THREE.Vector3(5, 5.3, 5))
const box7 = new THREE.Box3(new THREE.Vector3(19.7, 0, 0), new THREE.Vector3(20, 15, 5))
const box8 = new THREE.Box3(new THREE.Vector3(0, 14.7, 0), new THREE.Vector3(20, 15, 5))
const box9 = new THREE.Box3(new THREE.Vector3(15, 9.7, 0), new THREE.Vector3(15.3, 15, 5))

export const bbAll = [box1, box2, box3, box4, box5, box6, box7, box8, box9]