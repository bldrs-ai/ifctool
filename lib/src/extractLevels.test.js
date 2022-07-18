import fs from 'fs'
import {sumTest} from './extractLevels'
import {extractRELID} from './extractLevels'

//const extractRELID = require('./extractLevels');
//const fs = require('./fs');


  test("extractRELID", () => {
  
    expect(extractRELID('./lib/src/testdata/haus.ifc').length).toBe(2)
    console.log('test')
  });

  /*

  test("fileDuplication", () => {
  
    expect(fs.existsSync('haus.ifc_Level0.ifc')).toBe(true)
    expect(fs.existsSync('haus.ifc_Level1.ifc')).toBe(true)

  });

  test("CheckdeletedExpressID", () => {
  
    const sampleExpress = extractRELID('haus.ifc')[1][10]
    const contents = readFileSync('haus.ifc_Level0.ifc', 'utf-8');
    const result = contents.includes('#'+sampleExpress+'= ');
    expect(result).toBe(false)

  });

  */


