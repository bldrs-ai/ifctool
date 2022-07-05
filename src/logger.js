import log4js from 'log4js'


const loggers = {}
export const logLevels = ['off', 'mark', 'fatal', 'error', 'warn', 'info', 'debug', 'trace']
let DEFAULT_LEVEL = 'info'
log4js.configure({
  appenders: {
    err: {type: 'stderr'},
  },
  categories: {
    default: {appenders: ['err'], level: 'trace', enableCallStack: true},
  },
})


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
