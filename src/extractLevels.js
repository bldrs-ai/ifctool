import fs from 'fs'
import IfcModel from './IfcModel.js'

let ifcFilename = 'IFCFile'
//let relElementsArrAll = []
let IFCSpacesELementsArrAll = [] 

const USAGE = `Usage: node extractLevel.js <file.ifc>

EXAMPLE

node extractLevel.js index.ifc

OUT:
index.ifc_Level0.ifc
index.ifc_Level1.ifc
...

`

async function ExtractLevels() {
    let relElementsArrAll = await ExtractRELID()
    await CreateManipulateNewIFC(relElementsArrAll)
}

ExtractLevels()

async function ExtractRELID(){

    let args = process.argv.slice(2)
    if (args.length < 1) {
        console.error(USAGE)
        return
    }
    ifcFilename = args[0]
    console.log(ifcFilename)
    const model = new IfcModel()
    const rawFileData = fs.readFileSync(ifcFilename)
    await model.open(rawFileData)
    console.log(model.modelId)
    
    const ifcRelSpatial = model.getEltsOfNamedType('IFCRELCONTAINEDINSPATIALSTRUCTURE')
    const ifcSpace = model.getEltsOfNamedType('IFCSPACE')

    let AllrelElementsArr = []
    
    for (let i = 0; i< ifcRelSpatial.length; i++){
        const relElements = ifcRelSpatial[i].RelatedElements
        let relElementsArr = []
    
        for (let j = 0; j < relElements.length; j++) {
            relElementsArr[j] = relElements[j].value;
        }

        AllrelElementsArr[i] = relElementsArr
    }

    for (let i = 0; i< ifcSpace.length; i++){
        IFCSpacesELementsArrAll[i] =  ifcSpace[i].expressID
    }

    return AllrelElementsArr;


    //console.log('FirstFunctionComplete');

}

//still writing this
function GroupLevels(allLevels){
    for (let i = 0; i<allLevels; i++){

    }
}

function CreateManipulateNewIFC(AllrelElementsArr){

    for (let i = 0; i<AllrelElementsArr.length; i++){
        var newfilename = ifcFilename+'_Level'+i+'.ifc'
        let copyFilePromise = CopyFilesPromise(ifcFilename, newfilename, AllrelElementsArr[i])
        
    }
}


function findLineWithExpressID (IFCdata, expressID){
    var lines = IFCdata.split("\n");
    for (var i = 0; i < lines.length; i++)
    {
      var line = lines[i];
     {
      if (line.indexOf("#"+expressID+"=") != -1) 
      {
        return i
      }
    }
  }
}

function findLinesWithExpressID (IFCdata, expressIDs = []){
    const lineIndexes = []
    for (var i = 0; i < expressIDs.length; i++){
        try{
            lineIndexes[i] = findLineWithExpressID (IFCdata, expressIDs[i])
        }
        catch{}
    }
    return lineIndexes;
}


const removeLines = (data, lines = []) => {
    return data
        .split('\n')
        .filter((val, idx) => lines.indexOf(idx) === -1)
        .join('\n');
}

function removeLinesFromIFCwithExpressID (filename, expressIDsToRemove){
    let fileCopiedBool  = true;
    if (fileCopiedBool){
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) throw err;
            const linesToRemove = findLinesWithExpressID(data, expressIDsToRemove)
            console.log('Lines to remove from '+filename+' are '+linesToRemove)
            fs.writeFile(filename, removeLines(data, linesToRemove), 'utf8', function(err) {
                if (err) throw err;
                console.log("Lines "+linesToRemove+" have been removed from "+filename)
            });
        })
    }
    else{
        console.log("Files not copied yet")
    }

}

function CopyFiles(IFCfilename, newfilename){
    fs.copyFile(IFCfilename, newfilename, (err) => {
    if (err){
        return false;
        throw err;
    } 
    else{
        console.log('File '+newfilename+' is created')
        return true;
    }
  });
}

function CopyFilesPromise(IFCfilename, newfilename, expressIDsToRemoveIFCRel){
    return new Promise((resolve,reject)=>{
        fs.copyFile(IFCfilename, newfilename, (err) => {
            if (err){
                console.log('File '+newfilename+' was not created')
                reject
                throw err;
            } 
            else{
                console.log('File '+newfilename+' is created')
                resolve(true);
                removeLinesFromIFCwithExpressID (newfilename, expressIDsToRemoveIFCRel)
            }
        })
    })
}




