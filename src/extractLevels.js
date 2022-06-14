import fs from 'fs'
import IfcModel from './IfcModel.js'

var ifcFilename = 'IFCFile'
var relElementsArrAll = []
var IFCSpacesELementsArrAll = [] 

const USAGE = `Usage: node extractLevel.js <file.ifc>

EXAMPLE

node extractLevel.js index.ifc

OUT:
index.ifc_Level0.ifc
index.ifc_Level1.ifc
...

`


async function ExtractLevels(){
    await ExtractRELID()
    //console.log(relElementsArrAll)
    await CreateManipulateNewIFC()
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
    console.log(model.modelId);
    const ifcRelSpatial = model.getEltsOfNamedType('IFCRELCONTAINEDINSPATIALSTRUCTURE')
    const ifcSpace = model.getEltsOfNamedType('IFCSPACE')

    
    for (let i = 0; i< ifcRelSpatial.length; i++){
        const relElements = ifcRelSpatial[i].RelatedElements;
        const relElementsArr = []
    
        for (let j = 0; j < relElements.length; j++) {
            relElementsArr[j] = relElements[j].value;
        }

        relElementsArrAll[i] = relElementsArr
    }

    for (let i = 0; i< ifcSpace.length; i++){
        IFCSpacesELementsArrAll[i] =  ifcSpace[i].expressID
    }
    //console.log('FirstFunctionComplete');

}

//still writing this
function GroupLevels(allLevels){
    for (let i = 0; i<allLevels; i++){

    }
}

async function CreateManipulateNewIFC(){

    for (let i = 0; i<relElementsArrAll.length; i++){
        var newfilename = ifcFilename+'_Level'+i+'.ifc'
        await CopyFiles(ifcFilename, newfilename);
        var expressIDsToRemoveIFCRel = relElementsArrAll[i];
        var expressIDsToRemoveIFCSPACE = IFCSpacesELementsArrAll;
        //console.log(expressIDsToRemove);
        //console.log(newfilename);
        await removeLinesFromIFCwithExpressID (newfilename, expressIDsToRemoveIFCRel)
        await removeLinesFromIFCwithExpressID (newfilename, expressIDsToRemoveIFCSPACE)
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
            lineIndexes[i] = findLineWithExpressID (IFCdata, expressIDs[i]);
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
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) throw err;
        const linesToRemove = findLinesWithExpressID(data, expressIDsToRemove)
        console.log('Lines to remove from '+filename+' are '+linesToRemove)
        fs.writeFile(filename, removeLines(data, linesToRemove), 'utf8', function(err) {
            if (err) throw err;
            console.log("Lines "+linesToRemove+" have been removed from "+filename);
        });
    })
}

function CopyFiles(IFCfilename, newfilename){
fs.copyFile(IFCfilename, newfilename, (err) => {
    if (err) throw err;
    console.log('File '+newfilename+' is created')
  });
}



