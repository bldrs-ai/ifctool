# tools
Command line tools for working with models

## Install

```
yarn install
```

## Run

Currently just reads the index.ifc file in the current directory and optionally prints information for the element with the given expressID, or the 0th element if not given

```
node src/ifctool.js [expressID]
```

e.g. with the included index.ifc:

```
> node src/ifctool.js 42
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
