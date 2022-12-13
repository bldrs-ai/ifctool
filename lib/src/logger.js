import log4js from '@log4js-node/log4js-api'


const loggers = {}
export const logLevels = ['off', 'mark', 'fatal', 'error', 'warn', 'info', 'debug', 'trace']
let DEFAULT_LEVEL = 'warn'


/**
 * @param {string} name
 * @return {object} logger
 */
export function getLogger(name) {
  let logger = loggers[name]
  if (logger) {
    return logger
  }
  logger = log4js.getLogger(name)
  logger.level = DEFAULT_LEVEL
  loggers[name] = logger
  return logger
}


/**
 * @param {string} level
 */
export function setLogLevel(level) {
  DEFAULT_LEVEL = level
  for (const l in loggers) {
    if (Object.prototype.hasOwnProperty.call(loggers, l)) {
      loggers[l].level = DEFAULT_LEVEL
    }
  }
}


/**
 * Replaces the global console.log with a wrapper that removes web-ifc logging.
 */
export function installGlobalLogFilterForWebIfc() {
  /** The filter wrapper. */
  function filterLogger() {
    if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].startsWith('web-ifc: ')) {
      return
    }
    origLogger(...arguments)
  }
  const origLogger = console.log
  console.log = filterLogger
}


let syslog
/** Saves console.log reference and replaces it with with empty function. @see restoreSyslog. */
export function muteSyslog() {
  syslog = console.log
  console.log = () => {/**/}
}


/** Undoes muteSyslog.  */
export function restoreSyslog() {
  console.log = syslog
}
