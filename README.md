# ifctool
Command line tool for working with IFC models.  It extracts IFC elements by ID or types (via [web-ifc](https://github.com/tomvandig/web-ifc)), and exports as JSON or CSV (via [json2csv](https://www.npmjs.com/package/json2csv)).

## Via npx
Use [NPX](https://nodejs.dev/learn/the-npx-nodejs-package-runner) to run ifctool without cloning this repo.
```
> npx @bldrs-ai/ifctool model.ifc
```

## Usage

```
> node src/main.js
Usage: node src/main.js <file.ifc> [--flag[=value]]*
  <command> may be one of:

  --elts=id1[,id2,...]    Print the IFC elements with the given IDs
  --types=t1[,t2,...]     Print the IFC elements of the given types, case insensitive
  --deref                 Dereference complex elements (work in progress)
  --out=json|csv          Print as JSON (default) or CSV.  See https://github.com/buildingSMART/ifcJSON
    --fields=...          Format CSV, see: https://www.npmjs.com/package/json2csv
  --omitExpressId         Omit expressID
  --omitNull              Omit fields will null values
  --verbose               Print diagnostic information to error

Processing

The tool uses web-ifc to extract data from the IFC.
See https://github.com/tomvandig/web-ifc


ifcJSON

The output JSON is the result of JSON.stringify, with post-processing
to coerce web-ifc's object representation to ifcJSON.  This is a Work
in Progress.


EXAMPLES

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
web-ifc: 0.0.34 threading: 0
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
> node src/main.js src/testdata/buildingSMART_TestSet_JAVA/7m900_tue_hello_wall_with_door.ifc \
  --types=IFCDOOR --deref=basic --out=csv --fmt='["OverallHeight","OverallWidth"]'
web-ifc: 0.0.34 threading: 0
"OverallHeight","OverallWidth"
1.4,0.7000000000000001
```

# Versions
- 3.0.0: JSON output now includes header section, towards ifcJSON compliance.
- 2.0.0: Flag changes: no more --elt. Instead --elts and --types now support lists
- 1.0.0: Let's see how web-ifc's JSON looks!
