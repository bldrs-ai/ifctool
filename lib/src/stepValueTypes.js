// Value-type tags carried on the `type` field of a tape value object,
// e.g. `{type: STRING, value: 'Wall'}`, as produced by web-ifc's
// `GetLine()` and consumed by `Ifc.js` (`deref`, `reifyName`, ...).
//
// These mirror web-ifc's tape value-type codes (`STRING`, `LABEL`,
// `ENUM`, `REAL`, `REF` exported from 'web-ifc'). Conway's web-ifc
// compat surface (`@bldrs-ai/conway/web-ifc`) uses the same numbering,
// so the helpers work against either engine.
//
// They're defined here, rather than imported from 'web-ifc', so the
// main `@bldrs-ai/ifclib` entry doesn't depend on web-ifc at all;
// web-ifc is only an optional peer for `@bldrs-ai/ifclib/ifctool`.
// stepValueTypes.test.js asserts these against real web-ifc so drift
// fails a test.
export const STRING = 1
export const LABEL = 2
export const ENUM = 3
export const REAL = 4
export const REF = 5
