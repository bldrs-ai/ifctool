/* eslint-disable */
import * as THREE from 'three'


const box1 = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(20, .3, 5))
const box2 = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(.3, 15, 5))
const box3 = new THREE.Box3(new THREE.Vector3(9.7, 0, 0), new THREE.Vector3(10, 10, 5))
const box4 = new THREE.Box3(new THREE.Vector3(0, 9.7, 0), new THREE.Vector3(15, 10, 5))
const box5 = new THREE.Box3(new THREE.Vector3(0, 5, 0), new THREE.Vector3(5, 5.3, 5))
const box6 = new THREE.Box3(new THREE.Vector3(5, 0, 0), new THREE.Vector3(5, 5.3, 5))
const box7 = new THREE.Box3(new THREE.Vector3(19.7, 0, 0), new THREE.Vector3(20, 15, 5))
const box8 = new THREE.Box3(new THREE.Vector3(0, 14.7, 0), new THREE.Vector3(20, 15, 5))
const box9 = new THREE.Box3(new THREE.Vector3(15, 9.7, 0), new THREE.Vector3(15.3, 15, 5))


export let pointsAccepted = []
export let allPointsAccepted = []
export let pointsIntersected = []
export let allPointsIntersected = []
export let pointsEdge = []
export let allPointsEdge = []
export let geoEdges = []
export let allGeoEdges = []
let pointsVisited = []
export let pointsDenied = []
let pointsLeft = 0
let FFAttempt = 0

const FFmaxAttempt = 20
const voxelSize = 1
const maxThreshold = 10000


export const boundingBoxesAll = [box1, box2, box3, box4, box5, box6, box7, box8, box9]

RecursiveFloodFilling()

export async function FloodFilling() {
  const IFCUnionBox = calculateIFCBoundingBox(boundingBoxesAll)
  SatisfyFirstRandom(pointsAccepted, pointsVisited, voxelSize, IFCUnionBox, boundingBoxesAll)

  pointsLeft ++

  let intVis = 0
  while ((pointsLeft>0)&&(intVis<maxThreshold)) {
    try {
      CheckVoxelSurrounding(pointsAccepted[intVis], voxelSize, IFCUnionBox, boundingBoxesAll)
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

export function RecursiveFloodFilling() {
  FloodFilling()
  while (FFAttempt<FFmaxAttempt) {
    FloodFilling()
  }
}


export function box3ToBoxGeo(box3 = THREE.Box3) {
  const vecSize = new THREE.Vector3
  box3.getSize(vecSize)
  const boxCent = new THREE.Vector3
  box3.getCenter(boxCent)

  const boxGeo = new THREE.BoxGeometry(vecSize.x, vecSize.y, vecSize.z)
  boxGeo.translate(boxCent.x, boxCent.y, boxCent.z)

  return boxGeo
}

function Vec3ToString(vec = THREE.Vector3) {
  return '('+vec.x+','+vec.y+','+vec.z+')'
}

export function LogP(vec = THREE.Vector3) {
  console.log(Vec3ToString(vec))
}

export function LogAllP(points) {
  for (let i = 0; i<points.length; i++) {
    LogP(points[i])
  }
}

function LogBB(boundingBox = THREE.Box3) {
  console.log('MinP is :'+Vec3ToString(boundingBox.min))
  console.log('MaxP is :'+Vec3ToString(boundingBox.max))
}

function SatisfyFirstRandom(acceptedList, visted, voxelSize, IFCUnionBox, boundingBoxesAll) {
  if (acceptedList.length != 1) {
    const randomPoint = samplePointInBoundingBox(IFCUnionBox, voxelSize)
    if (checkVisitBefore(randomPoint, visted)==false) {
      CheckVoxel(randomPoint, voxelSize, IFCUnionBox, boundingBoxesAll)
    }
    SatisfyFirstRandom(acceptedList, randomPoint, voxelSize, IFCUnionBox, boundingBoxesAll)
  } else {
    return acceptedList[0]
  }
}

function calculateIFCBoundingBox(boundingBoxes) {
  let unionBox = new THREE.Box3
  const boundingBoxClone = []
  for (let i = 0; i<boundingBoxes.length; i++) {
    boundingBoxClone[i] = new THREE.Box3(boundingBoxes[i].min, boundingBoxes[i].max)
  }


  unionBox = boundingBoxClone[0]
  for (let i = 1; i<boundingBoxClone.length; i++) {
    unionBox = UnionBox(unionBox, boundingBoxClone[i])
  }

  return unionBox
}

function UnionBox(box1, box2) {
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

function GenRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function samplePointInBoundingBox(boundingBox = THREE.Box3, voxSize) {
  const bbMin = boundingBox.min
  const bbMax = boundingBox.max

  const randomX = GenRandom(bbMin.x+voxSize, bbMax.x-voxSize)
  const randomY = GenRandom(bbMin.y+voxSize, bbMax.y-voxSize)
  const randomZ = GenRandom(bbMin.z+voxSize, bbMax.z-voxSize)

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

function GeoFromPointAndDir(pointStart, adjIndex,voxelSize){
    const a = voxelSize/2
    const b = (Math.sqrt(3) * voxelSize)/2
    let cornerPoints = []

    if (adjIndex == 0){
        cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(a, b, b))
        cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(a, b, -b))
        cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(a, -b, b))
        cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(a, -b, -b))
    }
    if (adjIndex == 1){
        cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-a, b, b))
        cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-a, b, -b))
        cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-a, -b, b))
        cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-a, -b, -b))
    }
    if (adjIndex == 2){
        cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, a, b))
        cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, a, -b))
        cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, a, b))
        cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, a, -b))
    }
    if (adjIndex == 3){
        cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, -a, b))
        cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, -a, -b))
        cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, -a, b))
        cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, -a, -b))
    }
    if (adjIndex == 4){
        cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, b, a))
        cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, b, a))
        cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, -b, a))
        cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, -b, a))
    }
    if (adjIndex == 5){
        cornerPoints[0] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, b, -a))
        cornerPoints[1] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, b, -a))
        cornerPoints[2] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(b, -b, -a))
        cornerPoints[3] = new THREE.Vector3().addVectors(pointStart, new THREE.Vector3(-b, -b, -a))
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array( [
        cornerPoints[0].x, cornerPoints[0].y,  cornerPoints[0].z,
        cornerPoints[1].x, cornerPoints[1].y,  cornerPoints[1].z,
        cornerPoints[2].x, cornerPoints[2].y,  cornerPoints[2].z,

        cornerPoints[1].x, cornerPoints[1].y,  cornerPoints[1].z,
        cornerPoints[2].x, cornerPoints[2].y,  cornerPoints[2].z,
        cornerPoints[3].x, cornerPoints[3].y,  cornerPoints[3].z,
    ] );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    ///TODO
    return geometry

}

function meshBetweenPoints (pointStart, pointEnd){
    const vecBetween = new THREE.Vector3(pointEnd.x-pointStart.x,pointEnd.y-pointStart.y,pointEnd.z-pointStart.z)
    const vecLenght = vecBetween.length()
}



function CheckVoxel(point = THREE.Vector3, voxelSize, mainBoundingBox = THREE.Box3, boundingBoxesAll = []) {
  
  if (checkVisitBefore(point, pointsVisited)){
    if (checkVisitBefore(point, pointsIntersected)){
        return 0
    }
    else{
        return 2
    }
  }
  else{
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
  

  // SUGGESTION: 
  //INTERSECT SHOULD BE 0
  //POINT ACCEPTED SHOULD BE 1
  // POINT VISTED SHOULD BE 2
}

function CheckVoxelSurrounding(point = THREE.Vector3, voxelSize, mainBoundingBox = THREE.Box3, boundingBoxesAll = []) {
  // LogP(point)
  let successInt = 0
  const adjVoxel = adjacentVoxels(point, voxelSize)
  for (let i = 0; i<adjVoxel.length; i++) {
    let success = 0
    // console.log("reaches here in iteration: "+i+" in GenIteration: "+generalIteration)
      if (CheckPointInBoundingBox(adjVoxel[i], mainBoundingBox)) {
        success = CheckVoxel(adjVoxel[i], voxelSize, mainBoundingBox, boundingBoxesAll)
        if (success==1) {
          successInt++
          pointsLeft++
        }
        if (success==0){
            if (checkVisitBefore(point, pointsEdge)==false){
                pointsEdge.push(point)           
            }
            geoEdges.push(GeoFromPointAndDir(point,i,voxelSize))   
        }
      }
    
  }
  pointsLeft--
}

/* eslint-enable */
