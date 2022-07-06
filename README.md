# ifctool
Command line tool for working with IFC models.  It extracts IFC elements by ID or types (via [web-ifc](https://github.com/tomvandig/web-ifc)), and exports as JSON or CSV (via [json2csv](https://www.npmjs.com/package/json2csv)).

## Via npx
Use [NPX](https://nodejs.dev/learn/the-npx-nodejs-package-runner) to run ifctool without cloning this repo.  Always prefer @latest to avoid [npx cacheing issues](https://github.com/npm/cli/issues/2329).
```
> npx @bldrs-ai/ifctool@latest model.ifc
```
or run from source:
```
> node src/main.js model.ifc
```

## Usage
```
usage: ifctool <file.ifc>

options:
  --elts=id1[,id2,...]    Print the IFC elements with the given IDs
  --types=t1[,t2,...]     Print the IFC elements of the given types, case insensitive
  --deref                 Dereference complex elements (work in progress)
  --out=json|csv          Print as JSON (default) or CSV.  See https://github.com/buildingSMART/ifcJSON
    --fmt=...             Format CSV, see: https://www.npmjs.com/package/json2csv
  --omitExpressId         Omit expressID
  --omitNull              Omit fields will null values
  --log=[enum =>]         Set log level to one of: {off,error,exception,info,debug,verbose}.
                            default=info
  --version               Print the version of this tool, same as in package.json.
  --help                  Print these usage instructions.

Version: ifctool 4.1.2

# Processing

The tool uses web-ifc to extract data from the IFC.
See https://github.com/tomvandig/web-ifc


## ifcJSON

The output JSON is the result of JSON.stringify, with post-processing
to coerce web-ifc's object representation to ifcJSON.  This is a Work
in Progress.


# Examples

Print the root element of the model in JSON:

  node src/main.js model.ifc

with dereferncing and output as CSV

  node src/main.js model.ifc --deref --out=csv

with custom formatting

  node src/main.js model.ifc --types=IFCWALL,IFCWINDOW --out=csv \
    --fmt='["expressID","OverallWidth","OverallHeight"]'
```

e.g. with the included index.ifc:

```
> node src/main.js index.ifc --elts=5 --deref --omitNull
{
  "type": "ifcJSON",
  "version": "0.0.1",
  "originatingSystem": "IFC2JSON_js 3.0.2",
  "preprocessorVersion": "web-ifc 0.0.34",
  "time": "2022-06-25T15:38:56.359Z",
  "data": [
    {
      "expressID": 5,
      "type": "IFCTELECOMADDRESS",
      "Purpose": "USERDEFINED",
      "UserDefinedPurpose": "Phone",
      "TelephoneNumbers": [
        "+00 11 101 10 10"
      ],
      "WWWHomePageURL": "http://bldrs.ai"
    }
  ]
}
```

```
> node src/main.js src/testdata/IFC_2x3/7m900_tue_hello_wall_with_door.ifc --types=IFCDOOR --out=csv --deref --fmt='["OverallHeight","OverallWidth"]'
"OverallHeight","OverallWidth"
1.4,0.7000000000000001
```

# Versions
Following (semver)[https://semver.org/], backwards-incompatible API changes use a new major version number.
- 4.x: Full extract now includes all top-level elts with globalIds.  Better arg checking and error logging. 
- 3.x: JSON output now includes header section, towards ifcJSON compliance.
- 2.x: Flag changes: no more --elt. Instead --elts and --types now support lists
- 1.x: Let's see how web-ifc's JSON looks!
