// Usage: node tool/src/gen.js [number] > box-[number].ifc


const ifcBuildingId = 500
const ifcGeomSubCtx = 202
const ifcDirUp = 312
// Expected output:
/*
ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('IFC4'),'2;1');
FILE_NAME('box-1.ifc','2023-09-13',(''),(''),'','','');
FILE_SCHEMA(('IFC4'));
ENDSEC;
DATA;
#100=IFCPROJECT('UUID-Project',$,'Project of 1 boxes',$,$,$,$,(#201),#301);
#201=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-5,$,$);
#202=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,#201,$,.MODEL_VIEW.,$);
#301=IFCUNITASSIGNMENT((#311));
#311=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);
#312=IFCDIRECTION((0.,0.,1.));
#500=IFCBUILDING('UUID-building',$,'Test Building',$,$,#511,$,$,.ELEMENT.,$,$,$);
#519=IFCRELAGGREGATES('UUID-RelAggregates',$,$,$,#100,(#500));
#520=IFCRECTANGLEPROFILEDEF(.AREA.,'1m x 1m rectangle',$,1.,1.);
#1000=IFCBUILDINGELEMENTPROXY('UUID-Proxy',$,'1000','sample proxy',$,$,#1001,$,$);
#1001=IFCPRODUCTDEFINITIONSHAPE($,$,(#1002));
#1002=IFCSHAPEREPRESENTATION(#202,'Body','SweptSolid',(#1005));
#1003=IFCCARTESIANPOINT((34.,67.,28.));
#1004=IFCAXIS2PLACEMENT3D(#1003,$,$);
#1005=IFCEXTRUDEDAREASOLID(#520,#1004,#312,1.);
#1006=IFCRELCONTAINEDINSPATIALSTRUCTURE('UUID-Spatial',$,'Physical model',$,(#1000),#500);
ENDSEC;
END-ISO-10303-21;
*/


const numBoxen = parseInt(process.argv[2] || 1)
const projectTitle = `Project of ${numBoxen} boxes`

log(`${stepOpen()}
${ifcHeader(numBoxen)}
${dataOpen(projectTitle)}`)

boxen(numBoxen)

log(`${dataClose()}
${stepClose()}`)


/** Prints lots of boxen */
function boxen(num = 10) {
  const maxSpan = 100
  for (let i = 1; i <= num; i++) {
    const x = parseInt(Math.random() * maxSpan)
    const y = parseInt(Math.random() * maxSpan)
    const z = parseInt(Math.random() * maxSpan)
    // eslint-disable-next-line no-magic-numbers
    const id = i * 1000
    log(box(id, [x, y, z], ifcBuildingId, ifcGeomSubCtx, ifcDirUp))
  }
}


/** @return {string} STEP 10303-21 opening */
function stepOpen() {
  return `ISO-10303-21;`
}


/** @return {string} header */
function ifcHeader(num) {
  const date = new Date()
  const year = date.getFullYear()
  // eslint-disable-next-line no-magic-numbers
  const month = (`0${(date.getMonth() + 1)}`).slice(-2)
  // eslint-disable-next-line no-magic-numbers
  const day = (`0${date.getDate()}`).slice(-2)
  const ds = `${year}-${month}-${day}`
  return `HEADER;
FILE_DESCRIPTION(('IFC4'),'2;1');
FILE_NAME('box-${num}.ifc','${ds}',(''),(''),'','','');
FILE_SCHEMA(('IFC4'));
ENDSEC;`
}


/**
 * @param {string} title
 * @return {string} IFC data
 */
function dataOpen(title) {
  return `DATA;
#100=IFCPROJECT('UUID-Project',$,'${title}',$,$,$,$,(#201),#301);
#201=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-5,$,$);
#202=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,#201,$,.MODEL_VIEW.,$);
#301=IFCUNITASSIGNMENT((#311));
#311=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);
#312=IFCDIRECTION((0.,0.,1.));
#500=IFCBUILDING('UUID-building',$,'Test Building',$,$,#511,$,$,.ELEMENT.,$,$,$);
#519=IFCRELAGGREGATES('UUID-RelAggregates',$,$,$,#100,(#500));
#520=IFCRECTANGLEPROFILEDEF(.AREA.,'1m x 1m rectangle',$,1.,1.);`
}


/** @return {string} IFC endsec dor data */
function dataClose() {
  return `ENDSEC;`
}

/** @return {string} box shape */
function box(id, coord, buildingId, geomContextId, dirId) {
  const name = id
  const proxyId = id++ // #1000
  const shapeId = id++ // #1010
  const repId = id++ // #1020
  const pointId = id++
  const placeId = id++
  const extrudeId = id++ // #1021
  const profileId = 520 // #1022
  const relContainId = id++ // #10000
  return `#${proxyId}=IFCBUILDINGELEMENTPROXY('UUID-Proxy',$,'${name}','sample proxy',$,$,#${shapeId},$,$);
#${shapeId}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${repId}));
#${repId}=IFCSHAPEREPRESENTATION(#${geomContextId},'Body','SweptSolid',(#${extrudeId}));
#${pointId}=IFCCARTESIANPOINT((${ifcCoord(coord)}));
#${placeId}=IFCAXIS2PLACEMENT3D(#${pointId},$,$);
#${extrudeId}=IFCEXTRUDEDAREASOLID(#${profileId},#${placeId},#${dirId},1.);
#${relContainId}=IFCRELCONTAINEDINSPATIALSTRUCTURE('UUID-Spatial',$,'Physical model',$,(#${proxyId}),#${buildingId});`
}


/** @return {string} coord in ifc notation */
function ifcCoord(c) {
  return `${c[0]}.,${c[1]}.,${c[2]}.`
}


/** @return {string} STEP 10303-21 closing */
function stepClose() {
  return `END-ISO-10303-21;`
}


/** @param {string} msg */
function log(msg) {
  console.log(msg)
}
