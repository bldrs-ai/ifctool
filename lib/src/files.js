import {isBrowser, isNode} from './utils.js'


let fileSystem


/**
 * Differential and dynamic load of filesystem for use on node or in
 * browser.  The returned object is a singleton that will continue to
 * be the same object after the first call. Either 'fs' for node or
 * 'filer' in browser.
 *
 * @return {object} The appropriate filesystem for the current environment
 */
export function getFileSystem() {
  if (!fileSystem) {
    if (isBrowser()) {
      fileSystem = import('filer')
    } else if (isNode()) {
      // TODO(https://github.com/bldrs-ai/ifctool/issues/39):
      // currently only used by extractLevels.js, which we're not
      // using.  It needs to be refactored to use buffers
      // instead.
      // fileSystem = import('fs')
      throw new Error('Use of pluggable filesystem from getFileSystem() not yet implemented.')
    } else {
      throw new Error('Could not determine environment')
    }
  }
  return fileSystem
}
