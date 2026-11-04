// The main entry is engine-free: nothing reachable from here imports
// web-ifc, so consumers that bring their own engine (e.g. Share, on
// Conway) can use the Ifc.js helpers without installing it.
// The web-ifc-backed extractor (processIfcBuffer, extractIfcProps,
// maybeDeref, format) lives at the '@bldrs-ai/ifclib/ifctool' subpath
// since 6.0.0; keep it out of this file.
export * from './Ifc.js'
export * from './logger.js'
export * from './utils.js'
export * from './version.js'
