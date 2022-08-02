import * as THREE from 'three'
// import {bbAll} from './testdata/testSimpleBB.js'
// import {bbFromObj} from './testdata/testSampleOBJ.js'


export let pointsAccepted = []
export const allPointsAccepted = []
export let pointsIntersected = []
export const allPointsIntersected = []
export let pointsEdge = []
export const allPointsEdge = []
export let geoEdges = []
export const allGeoEdges = []
let pointsVisited = []
export let pointsDenied = []
let pointsLeft = 0
let FFAttempt = 0

const FFmaxAttempt = 20
const voxelSize = 1
const maxThreshold = 10000

// UNCOMMENT FOR HTML TEST RENDERING
// RecursiveFloodFilling(bbAll)
// NumberOfRooms(bbFromObj);
// NumberOfRooms(bbAll);

/** Calculates the number of rooms when given an array of bb as input
 * @param {[]} boundingBoxesAll - array of bounding boxes derived from the scene
 * @return {int} - number of rooms
 */
export function numberOfRooms(boundingBoxesAll) {
  recursiveFloodFilling(boundingBoxesAll)
  let numRooms = 0
  for (let i = 0; i< allGeoEdges.length; i++) {
    if (allPointsAccepted[i].length > 10) {
      numRooms++
    }
  }
  console.log('This model has '+numRooms+' rooms.')
  return numRooms
}

/** Executes floodFilling for one single space
 * @param {[]} boundingBoxesAll - array of bounding boxes derived from the scene
 * @return {[]} - points accepted in the single space floodFilling
 */
export async function floodFilling(boundingBoxesAll) {
  const IFCUnionBox = calculateIFCBoundingBox(boundingBoxesAll)
  satisfyFirstRandom(pointsAccepted, pointsVisited, voxelSize, IFCUnionBox, boundingBoxesAll)

  pointsLeft ++

  let intVis = 0
  while ((pointsLeft>0)&&(intVis<maxThreshold)) {
    try {
      checkVoxelSurrounding(pointsAccepted[intVis], voxelSize, IFCUnionBox, boundingBoxesAll)
    } catch {
      console.log('Error was found on pAccepted '+intVis)
    }
    intVis ++
  }

  allPointsAccepted.push(pointsAccepted)
  allPointsIntersected.push(pointsIntersected)
  allPointsEdge.push(pointsEdge)
  allGeoEdges.push(geoEdges)

  pointsVisited = []
  for (let i = 0; i<pointsAccepted.length; i++) {
    pointsVisited.push(pointsAccepted[i])
  }
  pointsAccepted = []
  pointsIntersected = []
  pointsDenied = []
  pointsEdge = []
  geoEdges = []
  FFAttempt++

  return pointsAccepted
}

/** Executes recursive floodFilling for multiple spaces until termination criteria is met
 * @param {[]} boundingBoxesAll - array of bounding boxes derived from the scene
 * @return {[]} - edge points for all floodFilled spaces
 */
export function recursiveFloodFilling(boundingBoxesAll) {
  floodFilling(boundingBoxesAll)
  while (FFAttempt<FFmaxAttempt) {
    floodFilling(boundingBoxesAll)
  }
  return allGeoEdges
}

/** Converts Three Box3 to BoxGeometry
 * @param {THREE.Box3} box3 - input Box3
 * @return {THREE.BoxGeometry} - output BoxGeometry
 */
export function box3ToBoxGeo(box3 = THREE.Box3) {
  const vecSize = new THREE.Vector3
  box3.getSize(vecSize)
  const boxCent = new THREE.Vector3
  box3.getCenter(boxCent)

  const boxGeo = new THREE.BoxGeometry(vecSize.x, vecSize.y, vecSize.z)
  boxGeo.translate(boxCent.x, boxCent.y, boxCent.z)

  return boxGeo
}

/** Converts vec3 to string for debug purposes
 * @param {THREE.Vector3} vec - input Vec3
 * @return {string} - output string
 */
function vec3ToString(vec = THREE.Vector3) {
  return '('+vec.x+','+vec.y+','+vec.z+')'
}

/** Logs a point for debug purposes
 * @param {THREE.Vector3} vec - input Vec3
 */
export function logP(vec = THREE.Vector3) {
  console.log(vec3ToString(vec))
}

/** Logs multiple points for debug purposes
 * @param {[]} points - array of Vec3
 */
export function LogAllP(points) {
  for (let i = 0; i<points.length; i++) {
    logP(points[i])
  }
}

/** Logs BB for debug purposes
 * @param {THREE.Box3} boundingBox - input BB
 */
export function logBB(boundingBox = THREE.Box3) {
  console.log('MinP is :'+vec3ToString(boundingBox.min))
  console.log('MaxP is :'+vec3ToString(boundingBox.max))
}

/** Find the first satisfied random point
 * @param {[]} acceptedList - array of all previous points accepted in the floodFilling process
 * @param {[]} visted - array of all previous visited points in the floodFilling process
 * @param {int} voxelSize - voxel size
 * @param {THREE.Box3} IFCUnionBox - global bounding box of all objects
 * @param {[]} boundingBoxesAll - array of bounding boxes derived from the scene
 * @return {THREE.Vector3} - random point to start the floodFilling process in new space
 */
function satisfyFirstRandom(acceptedList, visted, voxelSize, IFCUnionBox, boundingBoxesAll) {
  if (acceptedList.length != 1) {
    const randomPoint = samplePointInBoundingBox(IFCUnionBox, voxelSize)
    if (checkVisitBefore(randomPoint, visted)==false) {
      checkVoxel(randomPoint, voxelSize, IFCUnionBox, boundingBoxesAll)
    }
    satisfyFirstRandom(acceptedList, randomPoint, voxelSize, IFCUnionBox, boundingBoxesAll)
  } else {
    return acceptedList[0]
  }
}

/** Calculate the global bounding box which encapsulates all objects
 * @param {[]} boundingBoxes - array of bounding boxes derived from the scene
 * @return {THREE.Box3} - global bounding box which encapsulates all objects
 */
function calculateIFCBoundingBox(boundingBoxes) {
  let unionBox = new THREE.Box3
  const boundingBoxClone = []
  for (let i = 0; i<boundingBoxes.length; i++) {
    boundingBoxClone[i] = new THREE.Box3(boundingBoxes[i].min, boundingBoxes[i].max)
  }

  unionBox = boundingBoxClone[0]
  for (let i = 1; i<boundingBoxClone.length; i++) {
    unionBox = unionTwoBoxes(unionBox, boundingBoxClone[i])
  }

  return unionBox
}

/** Calculate boolean union between two boxes
 * @param {THREE.Box3} box1 - input box3
 * @param {THREE.Box3} box2 - input box3
 * @return {THREE.Box3} - union box3
 */
function unionTwoBoxes(box1, box2) {
  const newBBMinX = Math.min(box1.min.x, box2.min.x)
  const newBBMinY = Math.min(box1.min.y, box2.min.y)
  const newBBMinZ = Math.min(box1.min.z, box2.min.z)

  const newBBMaxX = Math.max(box1.max.x, box2.max.x)
  const newBBMaxY = Math.max(box1.max.y, box2.max.y)
  const newBBMaxZ = Math.max(box1.max.z, box2.max.z)


  const minP = new THREE.Vector3(newBBMinX, newBBMinY, newBBMinZ)
  const maxP = new THREE.Vector3(newBBMaxX, newBBMaxY, newBBMaxZ)


  const unionBox = new THREE.Box3(minP, maxP)
  return unionBox
}

/* eslint-disable */
function extractAllReqBoundingBoxes(IFCData) {
  // TODO
}

function CheckPointInBoundingBox(point = THREE.Vector3, boundingBox = THREE.Box3) {
  return boundingBox.containsPoint(point)
}

function checkVisitBefore(point, visited) {
  for (let i = 0; i<visited.length; i++) {
    if (PointsEqual(point, visited[i])) {
      return true
    }
  }
  return false
}

function PointsEqual(point1, point2) {
  if ((point1.x == point2.x) && (point1.y == point2.y) && (point1.z == point2.z)) {
    return true
  } else {
    return false
  }
}

function genRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function samplePointInBoundingBox(boundingBox = THREE.Box3, voxSize) {
  const bbMin = boundingBox.min
  const bbMax = boundingBox.max

  const randomX = genRandom(bbMin.x+voxSize, bbMax.x-voxSize)
  const randomY = genRandom(bbMin.y+voxSize, bbMax.y-voxSize)
  const randomZ = genRandom(bbMin.z+voxSize, bbMax.z-voxSize)

  const point = new THREE.Vector3(randomX, randomY, randomZ)

  return point
}

function adjacentVoxels(point = THREE.Vector3, voxelSize) {
  const adjVoxel = []
  adjVoxel[0] =new THREE.Vector3().addVectors(point, new THREE.Vector3(voxelSize, 0, 0))
  adjVoxel[1] =new THREE.Vector3().addVectors(point, new THREE.Vector3(-voxelSize, 0, 0))
  adjVoxel[2] =new THREE.Vector3().addVectors(point, new THREE.Vector3(0, voxelSize, 0))
  adjVoxel[3] =new THREE.Vector3().addVectors(point, new THREE.Vector3(0, -voxelSize, 0))
  adjVoxel[4] =new THREE.Vector3().addVectors(point, new THREE.Vector3(0, 0, voxelSize))
  adjVoxel[5] =new THREE.Vector3().addVectors(point, new THREE.Vector3(0, 0, -voxelSize))
  return adjVoxel
}

function GeoFromPointAndDir(pointStart, adjIndex, voxelSize) {
  const a = voxelSize/2
  const b = (Math.sqrt(3) * voxelSize)/2
  const cornerPoints = []

  if (adjIndex == 0) {
    cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(a, b, b))
    cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(a, b, -b))
    cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(a, -b, b))
    cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(a, -b, -b))
  }
  if (adjIndex == 1) {
    cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-a, b, b))
    cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-a, b, -b))
    cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-a, -b, b))
    cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-a, -b, -b))
  }
  if (adjIndex == 2) {
    cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, a, b))
    cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, a, -b))
    cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, a, b))
    cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, a, -b))
  }
  if (adjIndex == 3) {
    cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, -a, b))
    cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, -a, -b))
    cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, -a, b))
    cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, -a, -b))
  }
  if (adjIndex == 4) {
    cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, b, a))
    cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, b, a))
    cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, -b, a))
    cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, -b, a))
  }
  if (adjIndex == 5) {
    cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, b, -a))
    cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, b, -a))
    cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, -b, -a))
    cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, -b, -a))
  }

  const geometry = new THREE.BufferGeometry()
  const vertices = new Float32Array( [
    cornerPoints[0].x, cornerPoints[0].y, cornerPoints[0].z,
    cornerPoints[1].x, cornerPoints[1].y, cornerPoints[1].z,
    cornerPoints[2].x, cornerPoints[2].y, cornerPoints[2].z,

    cornerPoints[1].x, cornerPoints[1].y, cornerPoints[1].z,
    cornerPoints[2].x, cornerPoints[2].y, cornerPoints[2].z,
    cornerPoints[3].x, cornerPoints[3].y, cornerPoints[3].z,
  ] )
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) )

  // /TODO
  return geometry
}

function meshBetweenPoints(pointStart, pointEnd) {
  const vecBetween = new THREE.Vector3(pointEnd.x-pointStart.x, pointEnd.y-pointStart.y, pointEnd.z-pointStart.z)
  const vecLenght = vecBetween.length()
}


function checkVoxel(point = THREE.Vector3, voxelSize, mainBoundingBox = THREE.Box3, boundingBoxesAll = []) {
  if (checkVisitBefore(point, pointsVisited)) {
    if (checkVisitBefore(point, pointsIntersected)) {
      return 0
    } else {
      return 2
    }
  } else {
    pointsVisited.push(point)

    const voxelMin = new THREE.Vector3().addVectors(point, new THREE.Vector3(-voxelSize/2, -voxelSize/2, -voxelSize/2))
    const voxelMax = new THREE.Vector3().addVectors(point, new THREE.Vector3(voxelSize/2, voxelSize/2, voxelSize/2))

    const voxel = new THREE.Box3(voxelMin, voxelMax)

    let intersect = false

    for (let i = 0; i<boundingBoxesAll.length; i++) {
      if ((voxel.intersectsBox(boundingBoxesAll[i])) || (checkVisitBefore(point, pointsIntersected))) {
        pointsIntersected.push(point)
        intersect = true
        return 0
      }
    }

    if (intersect == false) {
      pointsAccepted.push(point)
      return 1
    }
  }

  // INTERSECT SHOULD BE 0
  // POINT ACCEPTED SHOULD BE 1
  // POINT VISTED SHOULD BE 2
}

function checkVoxelSurrounding(point = THREE.Vector3, voxelSize, mainBoundingBox = THREE.Box3, boundingBoxesAll = []) {
  // logP(point)
  let successInt = 0
  const adjVoxel = adjacentVoxels(point, voxelSize)
  for (let i = 0; i<adjVoxel.length; i++) {
    let success = 0
    // console.log("reaches here in iteration: "+i+" in GenIteration: "+generalIteration)
    if (CheckPointInBoundingBox(adjVoxel[i], mainBoundingBox)) {
      success = checkVoxel(adjVoxel[i], voxelSize, mainBoundingBox, boundingBoxesAll)
      if (success==1) {
        successInt++
        pointsLeft++
      }
      if (success==0) {
        if (checkVisitBefore(point, pointsEdge)==false) {
          pointsEdge.push(point)
        }
        geoEdges.push(GeoFromPointAndDir(point, i, voxelSize))
      }
    }
  }
  pointsLeft--
}

/* eslint-enable */
