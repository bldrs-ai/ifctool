// Usage: node tool/src/gen.js [number] > box-[number].ifc
// Here's 1 box:
/*
ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('IFC4'),'2;1');
FILE_NAME('example.ifc','2018-08-8',(''),(''),'','','');
FILE_SCHEMA(('IFC4'));
ENDSEC;
DATA;
#100=IFCPROJECT('UUID-Project',$,'Proxy with extruded box',$,$,$,$,(#201),#301);
#201=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-5,$,$);
#202=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,#201,$,.MODEL_VIEW.,$);
#301=IFCUNITASSIGNMENT((#311));
#311=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);
#500=IFCBUILDING('UUID-building',$,'Test Building',$,$,#511,$,$,.ELEMENT.,$,$,$);
#519=IFCRELAGGREGATES('UUID-RelAggregates',$,$,$,#100,(#500));
#1000=IFCBUILDINGELEMENTPROXY('UUID-Proxy',$,'P-1','sample proxy',$,$,#1010,$,$);
#1010=IFCPRODUCTDEFINITIONSHAPE($,$,(#1020));
#1020=IFCSHAPEREPRESENTATION(#202,'Body','SweptSolid',(#1021));
#1021=IFCEXTRUDEDAREASOLID(#1022,$,#1034,1.);
#1022=IFCRECTANGLEPROFILEDEF(.AREA.,'1m x 1m rectangle',$,1.,1.);
#1034=IFCDIRECTION((0.,0.,1.));
#10000=IFCRELCONTAINEDINSPATIALSTRUCTURE('UUID-Spatial',$,'Physical model',$,(#1000),#500);
ENDSEC;
END-ISO-10303-21;
*/


const numBoxen = parseInt(process.argv[2] || 1)
const projectTitle = `Project of ${numBoxen} boxes`

p(`
${stepOpen()}
${ifcHeader(numBoxen)}
${dataOpen(projectTitle)}
`)

boxen(numBoxen)

p(`
${dataClose()}
${stepClose()}
`)


/** Prints lots of boxen */
function boxen(num = 10) {
  const maxSpan = 100
  for (let i = 1; i <= num; i++) {
    const x = parseInt(Math.random() * maxSpan)
    const y = parseInt(Math.random() * maxSpan)
    const z = parseInt(Math.random() * maxSpan)
    // eslint-disable-next-line no-magic-numbers
    const id = i * 1000
    // eslint-disable-next-line no-magic-numbers
    p(box(id, [x, y, z], 500, 202, 312))
  }
}


/** @return {string} STEP 10303-21 opening */
function stepOpen() {
  return `ISO-10303-21;
`
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
ENDSEC;
`
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
#520=IFCRECTANGLEPROFILEDEF(.AREA.,'1m x 1m rectangle',$,1.,1.);
`
}


/** @return {string} IFC endsec dor data */
function dataClose() {
  return `
ENDSEC;
`
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
  return `
#${proxyId}=IFCBUILDINGELEMENTPROXY('UUID-Proxy',$,'${name}','sample proxy',$,$,#${shapeId},$,$);
#${shapeId}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${repId}));
#${repId}=IFCSHAPEREPRESENTATION(#${geomContextId},'Body','SweptSolid',(#${extrudeId}));
#${pointId}=IFCCARTESIANPOINT((${ifcCoord(coord)}));
#${placeId}=IFCAXIS2PLACEMENT3D(#${pointId},$,$);
#${extrudeId}=IFCEXTRUDEDAREASOLID(#${profileId},#${placeId},#${dirId},1.);
#${relContainId}=IFCRELCONTAINEDINSPATIALSTRUCTURE('UUID-Spatial',$,'Physical model',$,(#${proxyId}),#${buildingId});
`
}


/** @return {string} coord in ifc notation */
function ifcCoord(c) {
  return `${c[0]}.,${c[1]}.,${c[2]}.`
}


/** @return {string} STEP 10303-21 closing */
function stepClose() {
  return `END-ISO-10303-21;
`
}


/** @param {string} msg */
function p(msg) {
  console.log(msg)
}
