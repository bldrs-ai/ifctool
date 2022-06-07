# tools
Command line tools for working with models

## Install

```
yarn install
```

## Usage

```
> node src/ifctool.js
Usage: node ifctool.js <file.ifc> [--flag=value]*
  <command> may be one of:

  --elt=id       Print the IFC element with the given ID
  --type=type    Print the IFC elements of the given type
  --out=csv      Print as CSV instead of JSON
    --fields=... Format CSV, see: https://www.npmjs.com/package/json2csv

EXAMPLES

To print the root element of the model:

  node ifctool.js index.ifc --elt=1

As CSV

  node ifctool.js index.ifc --elt=1 --out=csv

With custom formatting

  node src/ifctool.js index.ifc --type=IFCBUILDINGELEMENTPROXY --out=csv --fmt='["Name.value"]'
```

e.g. with the included index.ifc:

```
> node src/ifctool.js --id=42
args:  [ '42' ]
web-ifc: 0.0.34 threading: 0
line 42:  IfcSIUnit {
  expressID: 42,
  type: 448429030,
  Dimensions: { type: 0 },
  UnitType: { type: 3, value: 'TIMEUNIT' },
  Prefix: null,
  Name: { type: 3, value: 'SECOND' }
}
```

```
> node src/ifctool.js index.ifc --type=IFCBUILDINGELEMENTPROXY --out=csv --fmt='["Name.value"]'
web-ifc: 0.0.34 threading: 0
"Name.value"
"Together"
"Together"
"Together"
"Together"
"Together"
"Together"
"Together"
```
